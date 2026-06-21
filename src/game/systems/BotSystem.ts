import Phaser from 'phaser'

import { TEAM_ROSTER_SIZE } from '../data/matchConfig'
import { getMapBounds, getMatchLineFacing, getMatchLineSpawn } from '../data/mapConfig'
import { BotPlayer } from '../entities/BotPlayer'
import type { Stick } from '../entities/Stick'
import type { StickSpawnSystem } from './StickSpawnSystem'
import { distance } from '../utils/math'
import { randomRange } from '../utils/random'

const MAP_WANDER_MARGIN = 120
const RETARGET_MIN_MS = 2200
const RETARGET_MAX_MS = 4800
const STUCK_MS = 1400
const MIN_TARGET_DIST = 180
const MIN_BOT_SPACING = 220
const MOVE_THRESHOLD = 8
const STICK_CHANCE = 0.38
const SECTOR_COLS = 5
const SECTOR_ROWS = 4
const SECTOR_PADDING = 80

interface MapRect {
  left: number
  top: number
  right: number
  bottom: number
}

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
    for (const bot of this.all) {
      bot.setMovement(0, 0)
      bot.body.setVelocity(0, 0)
      this.assignWanderTarget(bot, true)
      bot.retargetAt = time + randomRange(600, 1400) + bot.slotIndex * 180
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

      if (moved < 4) {
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
    const preferStick = Math.random() < STICK_CHANCE && sticks.length > 0

    if (preferStick) {
      const stickTarget = this.findStickTarget(bot, sticks)
      if (stickTarget && this.isTargetAcceptable(bot, stickTarget.x, stickTarget.y)) {
        bot.targetStickId = stickTarget.id
        bot.targetX = stickTarget.x + randomRange(-20, 20)
        bot.targetY = stickTarget.y + randomRange(-20, 20)
        return
      }
    }

    this.assignWanderTarget(bot, false)
  }

  private assignWanderTarget(bot: BotPlayer, spreadStart: boolean): void {
    bot.targetStickId = null

    for (let attempt = 0; attempt < 12; attempt++) {
      const point = spreadStart
        ? this.randomPointInSector(this.getBotSectorIndex(bot))
        : this.randomWanderPoint(bot)

      if (this.isTargetAcceptable(bot, point.x, point.y, spreadStart ? 80 : MIN_TARGET_DIST)) {
        bot.targetX = point.x
        bot.targetY = point.y
        return
      }
    }

    const fallback = this.randomPointInSector(this.getBotSectorIndex(bot))
    bot.targetX = fallback.x
    bot.targetY = fallback.y
  }

  private randomWanderPoint(bot: BotPlayer): { x: number; y: number } {
    if (Math.random() < 0.7) {
      return this.randomPointInSector(this.getBotSectorIndex(bot))
    }

    const sector = this.getBotSectorIndex(bot)
    const neighbor = (sector + Math.floor(Math.random() * 3) + 1) % (SECTOR_COLS * SECTOR_ROWS)
    return this.randomPointInSector(neighbor)
  }

  private findStickTarget(bot: BotPlayer, sticks: Stick[]): Stick | null {
    const sector = this.getSectorRect(this.getBotSectorIndex(bot))
    let best: Stick | null = null
    let bestScore = Infinity

    for (const stick of sticks) {
      if (!this.isStickInRect(stick, sector) && Math.random() > 0.25) continue

      const score = this.stickPriority(bot, stick)
      if (score < bestScore) {
        bestScore = score
        best = stick
      }
    }

    if (best) return best

    for (const stick of sticks) {
      const score = this.stickPriority(bot, stick)
      if (score < bestScore) {
        bestScore = score
        best = stick
      }
    }

    return best
  }

  private stickPriority(bot: BotPlayer, stick: Stick): number {
    let score = distance(bot.x, bot.y, stick.x, stick.y)

    for (const other of this.all) {
      if (other === bot) continue

      const toStick = distance(other.x, other.y, stick.x, stick.y)
      if (toStick < MIN_BOT_SPACING) {
        score += 600
      }

      const toTarget = distance(other.targetX, other.targetY, stick.x, stick.y)
      if (toTarget < MIN_BOT_SPACING * 0.75) {
        score += 350
      }
    }

    return score + randomRange(0, 40)
  }

  private isTargetAcceptable(
    bot: BotPlayer,
    x: number,
    y: number,
    minDist = MIN_TARGET_DIST,
  ): boolean {
    if (distance(bot.x, bot.y, x, y) < minDist) return false

    for (const other of this.all) {
      if (other === bot) continue
      if (distance(other.x, other.y, x, y) < MIN_BOT_SPACING) return false
      if (distance(other.targetX, other.targetY, x, y) < MIN_BOT_SPACING * 0.85) return false
    }

    return true
  }

  private getBotSectorIndex(bot: BotPlayer): number {
    const base = bot.team === 'blue' ? 0 : TEAM_ROSTER_SIZE
    return (base + bot.slotIndex) % (SECTOR_COLS * SECTOR_ROWS)
  }

  private getSectorRect(index: number): MapRect {
    const col = index % SECTOR_COLS
    const row = Math.floor(index / SECTOR_COLS) % SECTOR_ROWS
    const cellW = this.bounds.width / SECTOR_COLS
    const cellH = this.bounds.height / SECTOR_ROWS

    return {
      left: this.bounds.left + col * cellW + SECTOR_PADDING,
      top: this.bounds.top + row * cellH + SECTOR_PADDING,
      right: this.bounds.left + (col + 1) * cellW - SECTOR_PADDING,
      bottom: this.bounds.top + (row + 1) * cellH - SECTOR_PADDING,
    }
  }

  private randomPointInSector(index: number): { x: number; y: number } {
    const rect = this.getSectorRect(index)
    return {
      x: randomRange(rect.left, rect.right),
      y: randomRange(rect.top, rect.bottom),
    }
  }

  private isStickInRect(stick: Stick, rect: MapRect): boolean {
    return stick.x >= rect.left && stick.x <= rect.right && stick.y >= rect.top && stick.y <= rect.bottom
  }
}
