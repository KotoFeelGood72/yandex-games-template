import Phaser from 'phaser'

import { CATCHERS, PATROL_WAYPOINTS } from '../data/catcherConfig'
import {
  CATCH_INVINCIBILITY_MS,
  CATCH_KNOCKBACK,
  HIDE_DETECTION_MULTIPLIER,
} from '../data/matchConfig'
import { Catcher } from '../entities/Catcher'
import type { Player } from '../entities/Player'
import type { BotPlayer } from '../entities/BotPlayer'
import { calcCatchLoss } from '../domain/scoreCalc'
import { distance } from '../utils/math'
import { applySeparation } from '../utils/separation'

export interface CatchResult {
  player: Player | BotPlayer
  lostNeon: number
  lostSushi: number
  dropX: number
  dropY: number
}

const CATCHER_SEPARATION = 52
const CATCHER_CATCH_COOLDOWN_MS = 800

export class CatcherSystem {
  readonly catchers: Catcher[] = []

  constructor(private readonly scene: Phaser.Scene) {
    CATCHERS.forEach((def, index) => {
      const wp = PATROL_WAYPOINTS[index % PATROL_WAYPOINTS.length]!
      const catcher = new Catcher(scene, def, wp.x, wp.y)
      catcher.waypointIndex = (index * 2) % PATROL_WAYPOINTS.length
      this.catchers.push(catcher)
    })
  }

  getTraderCatcher(): Catcher | null {
    return this.catchers.find((c) => c.isTrader) ?? null
  }

  setTrader(catcher: Catcher): void {
    for (const c of this.catchers) {
      c.setTrader(c === catcher)
      if (c !== catcher) {
        c.chaseTarget = null
        c.state = 'patrol'
      }
    }
  }

  clearTrader(): void {
    for (const c of this.catchers) {
      c.setTrader(false)
    }
  }

  update(
    time: number,
    deltaMs: number,
    targets: Array<Player | BotPlayer>,
    onCatch: (result: CatchResult) => void,
  ): void {
    for (const catcher of this.catchers) {
      if (catcher.isTrader) {
        catcher.body.setVelocity(0, 0)
        catcher.update(deltaMs)
        catcher.syncTraderGlow()
        continue
      }

      if (time < catcher.catchCooldownUntil) {
        catcher.body.setVelocity(0, 0)
        catcher.update(deltaMs)
        continue
      }

      const target = this.findTarget(catcher, targets, time)
      this.updateCatcherMovement(catcher, target, time)

      if (target) {
        if (
          distance(catcher.x, catcher.y, target.x, target.y) <= catcher.def.catchRadius &&
          !target.isInvincible(time) &&
          !target.isExchanging(time)
        ) {
          this.handleCatch(catcher, target, time, onCatch)
        }
      }

      catcher.update(deltaMs)
      catcher.syncTraderGlow()
    }

    const mobileCatchers = this.catchers.filter((c) => !c.isTrader)
    applySeparation(mobileCatchers, CATCHER_SEPARATION, 0.55)
  }

  private findTarget(
    catcher: Catcher,
    targets: Array<Player | BotPlayer>,
    time: number,
  ): Player | BotPlayer | null {
    let nearest: Player | BotPlayer | null = null
    let nearestDist = Infinity

    for (const target of targets) {
      const detectRadius = target.isHidden(time)
        ? catcher.def.detectRadius * HIDE_DETECTION_MULTIPLIER
        : catcher.def.detectRadius

      const dist = distance(catcher.x, catcher.y, target.x, target.y)
      if (dist <= detectRadius && dist < nearestDist) {
        nearest = target
        nearestDist = dist
      }
    }

    if (nearest) {
      catcher.state = 'chase'
      catcher.chaseUntil = time + catcher.def.chaseDurationMs
      catcher.chaseTarget = nearest
      return nearest
    }

    if (
      catcher.state === 'chase' &&
      time < catcher.chaseUntil &&
      catcher.chaseTarget?.sprite.active
    ) {
      return catcher.chaseTarget
    }

    catcher.state = 'patrol'
    catcher.chaseTarget = null
    return null
  }

  private updateCatcherMovement(
    catcher: Catcher,
    target: Player | BotPlayer | null,
    time: number,
  ): void {
    if (target && catcher.state === 'chase' && time < catcher.chaseUntil) {
      this.scene.physics.moveToObject(catcher.sprite, target.sprite, catcher.def.speed)
      return
    }

    catcher.state = 'patrol'
    catcher.chaseTarget = null
    const wp = PATROL_WAYPOINTS[catcher.waypointIndex]!
    const dist = distance(catcher.x, catcher.y, wp.x, wp.y)

    if (dist < 28) {
      catcher.waypointIndex = (catcher.waypointIndex + 1) % PATROL_WAYPOINTS.length
    }

    this.scene.physics.moveTo(catcher.sprite, wp.x, wp.y, catcher.def.patrolSpeed)
  }

  private handleCatch(
    catcher: Catcher,
    target: Player | BotPlayer,
    time: number,
    onCatch: (result: CatchResult) => void,
  ): void {
    const { lostNeon, lostSushi, remaining } = calcCatchLoss(target.inventory)

    target.applyInvincibility(time, CATCH_INVINCIBILITY_MS)
    target.applyKnockback(catcher.x, catcher.y, CATCH_KNOCKBACK)
    catcher.state = 'patrol'
    catcher.chaseUntil = 0
    catcher.chaseTarget = null
    catcher.catchCooldownUntil = time + CATCHER_CATCH_COOLDOWN_MS

    if (lostNeon === 0 && lostSushi === 0) return

    target.inventory = remaining

    onCatch({
      player: target,
      lostNeon,
      lostSushi,
      dropX: target.x,
      dropY: target.y,
    })
  }
}
