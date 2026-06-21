import Phaser from 'phaser'

import { LOCAL_PLAYER_SLOT, TEAM_ROSTER_SIZE } from '../data/matchConfig'
import { DEFAULT_MATCH_PLAYER } from '../data/playerConfig'
import { getMatchLineFacing, getMatchLineSpawn } from '../data/mapConfig'
import { Player } from '../entities/Player'
import { calcInventoryScore } from '../domain/scoreCalc'
import { ArenaSystem } from '../systems/ArenaSystem'
import { AsyncMultiplayerSystem } from '../systems/AsyncMultiplayerSystem'
import { BotSystem } from '../systems/BotSystem'
import { CameraSystem } from '../systems/CameraSystem'
import { CatcherSystem } from '../systems/CatcherSystem'
import { DecoratorSystem } from '../systems/DecoratorSystem'
import { DropSystem } from '../systems/DropSystem'
import { ExchangeSystem } from '../systems/ExchangeSystem'
import { InfiniteTilemapSystem } from '../systems/InfiniteTilemapSystem'
import { MatchCountdownSystem } from '../systems/MatchCountdownSystem'
import { MatchInputSystem } from '../systems/MatchInputSystem'
import { MatchTimerSystem } from '../systems/MatchTimerSystem'
import { ParticipantCollisionSystem } from '../systems/ParticipantCollisionSystem'
import { ScoreSystem } from '../systems/ScoreSystem'
import { StickSpawnSystem } from '../systems/StickSpawnSystem'
import { TeamSystem } from '../systems/TeamSystem'
import { TraderSystem } from '../systems/TraderSystem'
import { useInputStore } from '@/stores/inputStore'
import { useMatchStore } from '@/stores/matchStore'
import { useMetaStore } from '@/stores/metaStore'
import { gameplayPause } from '@/yandex/sdk'
import { PARTICIPANT_MIN_DISTANCE, clampParticipantsToMap, resolveParticipantOverlap } from '../utils/separation'

export class MatchScene extends Phaser.Scene {
  private player!: Player
  private arena!: ArenaSystem
  private cameraSystem!: CameraSystem
  private tilemap!: InfiniteTilemapSystem
  private decoratorSystem!: DecoratorSystem
  private matchInput!: MatchInputSystem
  private stickSpawn!: StickSpawnSystem
  private catcherSystem!: CatcherSystem
  private traderSystem!: TraderSystem
  private exchangeSystem!: ExchangeSystem
  private dropSystem!: DropSystem
  private timerSystem!: MatchTimerSystem
  private scoreSystem!: ScoreSystem
  private teamSystem!: TeamSystem
  private botSystem!: BotSystem
  private asyncMp!: AsyncMultiplayerSystem
  private participantCollision!: ParticipantCollisionSystem
  private countdownSystem!: MatchCountdownSystem
  private lastHudSync = 0

  constructor() {
    super({ key: 'MatchScene' })
  }

  create(): void {
    const matchStore = useMatchStore()
    const inputStore = useInputStore()
    const metaStore = useMetaStore()

    matchStore.beginMatch()
    inputStore.reset()

    this.arena = new ArenaSystem(this)
    const spawn = getMatchLineSpawn('blue', LOCAL_PLAYER_SLOT, TEAM_ROSTER_SIZE)
    this.player = new Player(this, spawn.x, spawn.y, DEFAULT_MATCH_PLAYER, 'blue', true)
    const blueFacing = getMatchLineFacing('blue')
    this.player.faceDirection(blueFacing.x, blueFacing.y)

    this.matchInput = new MatchInputSystem(this)
    this.matchInput.init()
    this.setupKeyboardFocus()

    this.cameraSystem = new CameraSystem(this)
    this.cameraSystem.setBounds(this.arena)
    this.cameraSystem.centerOn(0, 0)
    this.tilemap = new InfiniteTilemapSystem(this)
    this.decoratorSystem = new DecoratorSystem(this)

    this.stickSpawn = new StickSpawnSystem(this)
    this.stickSpawn.initMap()

    this.catcherSystem = new CatcherSystem(this)
    this.traderSystem = new TraderSystem(this, this.catcherSystem)
    this.traderSystem.init()

    this.exchangeSystem = new ExchangeSystem()
    this.dropSystem = new DropSystem(this)
    this.timerSystem = new MatchTimerSystem()
    this.scoreSystem = new ScoreSystem()
    this.teamSystem = new TeamSystem()
    this.botSystem = new BotSystem(this, this.stickSpawn, LOCAL_PLAYER_SLOT)
    this.countdownSystem = new MatchCountdownSystem()

    this.participantCollision = new ParticipantCollisionSystem(this)
    this.participantCollision.add(this.player)
    for (const bot of this.botSystem.all) {
      this.participantCollision.add(bot)
    }
    this.participantCollision.setup()

    this.asyncMp = new AsyncMultiplayerSystem(this)

    void this.asyncMp.init(metaStore.bestKills ?? 0, 1)

    matchStore.setCountdown(this.countdownSystem.getCountdownDigit())

    this.scale.on('resize', () => {
      this.cameraSystem.update()
    })

    this.events.on('shutdown', () => {
      this.asyncMp.destroy()
      this.traderSystem.destroy()
      this.decoratorSystem.destroy()
    })
  }

  update(_time: number, delta: number): void {
    const matchStore = useMatchStore()
    const inputStore = useInputStore()

    if (matchStore.paused || matchStore.finished) {
      this.player.body.setVelocity(0, 0)
      this.botSystem.freezeAll()
      return
    }

    const now = this.time.now
    const deltaMs = delta

    if (matchStore.countdownActive) {
      this.updateCountdown(now, deltaMs)
      return
    }

    if (this.timerSystem.tick(deltaMs)) {
      this.finishMatch()
      return
    }

    if (this.timerSystem.shouldSpawnGolden()) {
      const golden = this.stickSpawn.spawnGoldenOnce()
      if (golden) {
        matchStore.syncState({
          ...this.buildSyncPayload(),
          goldenOnMap: true,
          goldenX: golden.x,
          goldenY: golden.y,
        })
      }
    }

    const traderChanged = this.traderSystem.update(this.timerSystem.elapsedMs)
    if (traderChanged) {
      const zone = this.traderSystem.getTraderZoneHint()
      matchStore.syncState({
        ...this.buildSyncPayload(),
        traderActive: true,
        traderZoneX: zone?.x ?? 0,
        traderZoneY: zone?.y ?? 0,
      })
      this.lastHudSync = now
    }

    let moveX = 0
    let moveY = 0
    if (inputStore.moveX !== 0 || inputStore.moveY !== 0) {
      moveX = inputStore.moveX
      moveY = inputStore.moveY
    } else {
      const kb = this.matchInput.getMovementVector()
      moveX = kb.x
      moveY = kb.y
    }

    this.player.setMovement(moveX, moveY)

    if (inputStore.consumeDashPress()) {
      this.matchInput.queueDash()
    }

    this.matchInput.consumeDash(this.player, now)
    this.matchInput.consumeHide(this.player, now)
    this.player.update(now, deltaMs)

    this.botSystem.update(now, deltaMs)

    const collectors = this.getParticipants()

    this.stickSpawn.update(now, collectors, (collector, stick) => {
      if (stick.kind === 'golden') {
        collector.addStick('golden', 1)
      } else if (stick.kind === 'sushi') {
        collector.addStick('sushi', 1)
      } else {
        collector.addStick('neon', 1)
      }

      if (collector.isLocal) {
        this.asyncMp.recordEvent({
          type: 'collect',
          stickId: stick.id,
        })
      }
    })

    this.dropSystem.update(collectors)

    this.catcherSystem.update(now, deltaMs, collectors, (result) => {
      this.dropSystem.scatter(result.dropX, result.dropY, result.lostNeon, result.lostSushi)

      if (result.player.isLocal) {
        this.asyncMp.recordEvent({
          type: 'caught',
          catcherId: 'local',
          lostNeon: result.lostNeon,
          lostSushi: result.lostSushi,
        })
      }
    })

    const trader = this.traderSystem.getActiveTrader()
    this.exchangeSystem.update(
      now,
      deltaMs,
      this.player,
      trader,
      this.matchInput.isInteractDown() || inputStore.interactHeld,
      () => {
        this.asyncMp.recordEvent({
          type: 'exchange',
          traderId: trader?.def.id ?? 'trader',
          amount: 1,
        })
      },
    )

    this.asyncMp.recordMove(now, this.player.x, this.player.y, moveX, moveY)
    this.asyncMp.update(delta / 1000)

    resolveParticipantOverlap(this.getParticipants(), PARTICIPANT_MIN_DISTANCE)
    clampParticipantsToMap(this.getParticipants())

    this.cameraSystem.update()
    this.tilemap.update(this.cameras.main)

    const zone = this.traderSystem.getTraderZoneHint()
    const payload = {
      ...this.buildSyncPayload(),
      traderActive: !!trader,
      traderZoneX: zone?.x ?? 0,
      traderZoneY: zone?.y ?? 0,
      exchangeProgress: this.exchangeSystem.getProgress(),
      dashCooldownLeft: Math.max(0, this.player.dashCooldownUntil - now),
      hideCooldownLeft: Math.max(0, this.player.hideCooldownUntil - now),
    }

    const hudDirty =
      this.exchangeSystem.isActive() ||
      now - this.lastHudSync >= 150

    if (hudDirty) {
      this.lastHudSync = now
      matchStore.syncState(payload)
    }
  }

  private updateCountdown(now: number, deltaMs: number): void {
    const matchStore = useMatchStore()

    matchStore.setCountdown(this.countdownSystem.getCountdownDigit())

    this.player.setMovement(0, 0)
    this.player.body.setVelocity(0, 0)
    this.botSystem.freezeAll()

    this.cameraSystem.update()
    this.tilemap.update(this.cameras.main)

    if (!this.countdownSystem.tick(deltaMs)) return

    matchStore.startLivePhase()
    this.cameraSystem.follow(this.player)
    this.botSystem.prepareForMatchStart(now)
    resolveParticipantOverlap(this.getParticipants(), PARTICIPANT_MIN_DISTANCE)
    matchStore.syncState(this.buildSyncPayload())
  }

  private getParticipants(): Player[] {
    return [this.player, ...this.botSystem.all, ...this.asyncMp.ghosts]
  }

  private buildSyncPayload() {
    const participants = this.getParticipants()
    const scores = this.scoreSystem.compute(participants)

    return {
      elapsedMs: this.timerSystem.elapsedMs,
      remainingMs: this.timerSystem.remainingMs,
      blueScore: scores.blue,
      pinkScore: scores.pink,
      playerNeon: this.player.inventory.neon,
      playerSushi: this.player.inventory.sushi,
      playerGolden: this.player.inventory.golden,
      exchangeProgress: this.exchangeSystem.getProgress(),
      traderActive: !!this.traderSystem.getActiveTrader(),
    }
  }

  private finishMatch(): void {
    const matchStore = useMatchStore()
    const metaStore = useMetaStore()
    const participants = this.getParticipants()
    const scores = this.scoreSystem.compute(participants)
    const result = this.scoreSystem.winner(scores)

    matchStore.endMatch(result)
    void this.asyncMp.pushResult(
      calcInventoryScore(this.player.inventory),
      1,
      scores.blue,
    )

    if (scores.blue > metaStore.bestKills) {
      metaStore.bestKills = scores.blue
      metaStore.persist()
    }

    this.scene.pause()
    gameplayPause()
  }

  private setupKeyboardFocus(): void {
    this.input.keyboard?.on('keydown', () => {
      if (!this.game.canvas.hasAttribute('tabindex')) {
        this.game.canvas.setAttribute('tabindex', '0')
      }
      this.game.canvas.focus()
    })
  }
}
