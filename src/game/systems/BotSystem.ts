import Phaser from 'phaser'

import { TEAM_ROSTER_SIZE } from '../data/matchConfig'
import { getMapBounds, getMatchLineFacing, getMatchLineSpawn } from '../data/mapConfig'
import { BotPlayer } from '../entities/BotPlayer'
import type { Stick } from '../entities/Stick'
import type { StickSpawnSystem } from './StickSpawnSystem'
import { distance } from '../utils/math'
import { randomRange } from '../utils/random'

const TARGET_CLAIM_RADIUS = 72
const APPROACH_OFFSET = 36
const MAP_WANDER_MARGIN = 160
const RETARGET_MIN_MS = 1800
const RETARGET_MAX_MS = 3600
const STUCK_MS = 1000
const MIN_TARGET_DIST = 64
const STICK_SEARCH_RADIUS = 1600
const MOVE_THRESHOLD = 8

interface BotMotionState {
  x: number
  y: number
  stuckMs: number
}

export class BotSystem {
  readonly blueBots: BotPlayer[] = []
  readonly pinkBots: BotPlayer[] = []
  private readonly bounds = getMapBounds()
  private readonly motion = new Map<BotPlayer, BotMotionState>()

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly stickSpawn: StickSpawnSystem,
    localPlayerSlot: number,
  ) {
    const blueFacing = getMatchLineFacing('blue')
    for (let i = 0; i < TEAM_ROSTER_SIZE; i++) {
      if (i === localPlayerSlot) continue

      const spawn = getMatchLineSpawn('blue', i, TEAM_ROSTER_SIZE)
      const bot = new BotPlayer(scene, spawn.x, spawn.y, 'blue', i)
      bot.faceDirection(blueFacing.x, blueFacing.y)
      bot.retargetAt = Number.MAX_SAFE_INTEGER
      bot.targetX = spawn.x
      bot.targetY = spawn.y
      this.blueBots.push(bot)
      this.initMotion(bot)
    }

    const pinkFacing = getMatchLineFacing('pink')
    for (let i = 0; i < TEAM_ROSTER_SIZE; i++) {
      const spawn = getMatchLineSpawn('pink', i, TEAM_ROSTER_SIZE)
      const bot = new BotPlayer(scene, spawn.x, spawn.y, 'pink', i)
      bot.faceDirection(pinkFacing.x, pinkFacing.y)
      bot.retargetAt = Number.MAX_SAFE_INTEGER
      bot.targetX = spawn.x
      bot.targetY = spawn.y
      this.pinkBots.push(bot)
      this.initMotion(bot)
    }
  }

  get all(): BotPlayer[] {
    return [...this.blueBots, ...this.pinkBots]
  }

  prepareForMatchStart(time: number): void {
    const sticks = this.stickSpawn.getActiveSticks()

    for (const bot of this.all) {
      bot.setMovement(0, 0)
      bot.body.setVelocity(0, 0)
      this.assignNextTarget(bot, sticks)
      bot.retargetAt = time + randomRange(800, 1600) + bot.slotIndex * 120
      const motion = this.getMotion(bot)
      motion.stuckMs = 0
      motion.x = bot.x
      motion.y = bot.y
    }
  }

  freezeAll(): void {
    for (const bot of this.all) {
      bot.setMovement(0, 0)
      bot.body.setVelocity(0, 0)
    }
  }

  update(time: number, delta = 16): void {
    const sticks = this.stickSpawn.getActiveSticks()

    for (const bot of this.all) {
      const motion = this.getMotion(bot)
      const moved = distance(bot.x, bot.y, motion.x, motion.y)

      if (moved < 3) {
        motion.stuckMs += delta
      } else {
        motion.stuckMs = 0
      }

      motion.x = bot.x
      motion.y = bot.y

      if (time >= bot.retargetAt || motion.stuckMs >= STUCK_MS) {
        this.assignNextTarget(bot, sticks)
        bot.retargetAt = time + randomRange(RETARGET_MIN_MS, RETARGET_MAX_MS)
        motion.stuckMs = 0
      }

      const dx = bot.targetX - bot.x
      const dy = bot.targetY - bot.y
      const len = Math.hypot(dx, dy)

      if (len > MOVE_THRESHOLD) {
        bot.setMovement(dx / len, dy / len)
      } else {
        bot.setMovement(0, 0)
      }

      bot.update(time, delta)
    }
  }

  private initMotion(bot: BotPlayer): void {
    this.motion.set(bot, { x: bot.x, y: bot.y, stuckMs: 0 })
  }

  private getMotion(bot: BotPlayer): BotMotionState {
    let state = this.motion.get(bot)
    if (!state) {
      state = { x: bot.x, y: bot.y, stuckMs: 0 }
      this.motion.set(bot, state)
    }
    return state
  }

  private assignNextTarget(bot: BotPlayer, sticks: Stick[]): void {
    for (let attempt = 0; attempt < 8; attempt++) {
      const candidate = this.buildTarget(bot, sticks, attempt)
      if (distance(bot.x, bot.y, candidate.x, candidate.y) >= MIN_TARGET_DIST) {
        bot.targetX = candidate.x
        bot.targetY = candidate.y
        return
      }
    }

    bot.targetStickId = null
    bot.targetX = randomRange(
      this.bounds.left + MAP_WANDER_MARGIN,
      this.bounds.right - MAP_WANDER_MARGIN,
    )
    bot.targetY = randomRange(
      this.bounds.top + MAP_WANDER_MARGIN,
      this.bounds.bottom - MAP_WANDER_MARGIN,
    )
  }

  private buildTarget(
    bot: BotPlayer,
    sticks: Stick[],
    attempt: number,
  ): { x: number; y: number } {
    const angle = (bot.slotIndex / TEAM_ROSTER_SIZE) * Math.PI * 2
    const offsetX = Math.cos(angle) * APPROACH_OFFSET
    const offsetY = Math.sin(angle) * APPROACH_OFFSET

    const stick = this.findStickTarget(bot, sticks, attempt)
    if (stick) {
      bot.targetStickId = stick.id
      return { x: stick.x + offsetX, y: stick.y + offsetY }
    }

    bot.targetStickId = null
    return {
      x: randomRange(
        this.bounds.left + MAP_WANDER_MARGIN,
        this.bounds.right - MAP_WANDER_MARGIN,
      ),
      y: randomRange(
        this.bounds.top + MAP_WANDER_MARGIN,
        this.bounds.bottom - MAP_WANDER_MARGIN,
      ),
    }
  }

  private findStickTarget(bot: BotPlayer, sticks: Stick[], attempt: number): Stick | null {
    if (sticks.length === 0) return null

    const ranked = [...sticks]
      .filter((stick) => distance(bot.x, bot.y, stick.x, stick.y) <= STICK_SEARCH_RADIUS)
      .sort((a, b) => this.stickPriority(bot, a) - this.stickPriority(bot, b))

    if (ranked.length === 0) {
      const fallbackIndex = (bot.slotIndex + attempt) % sticks.length
      return sticks[fallbackIndex] ?? null
    }

    const startIndex = (bot.slotIndex + attempt) % ranked.length
    for (let i = 0; i < ranked.length; i++) {
      const stick = ranked[(startIndex + i) % ranked.length]!
      const claimed = this.all.some(
        (other) =>
          other !== bot &&
          other.targetStickId === stick.id &&
          distance(other.x, other.y, stick.x, stick.y) < TARGET_CLAIM_RADIUS,
      )
      if (!claimed) return stick
    }

    return ranked[startIndex] ?? null
  }

  private stickPriority(bot: BotPlayer, stick: Stick): number {
    const teamBias = bot.team === 'blue' ? 0 : 13
    const slotBias = ((bot.slotIndex + teamBias) * 17) % 41
    return distance(bot.x, bot.y, stick.x, stick.y) + slotBias
  }
}
