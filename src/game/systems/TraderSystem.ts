import Phaser from 'phaser'

import { TRADER_INTERVAL_MS, TRADER_ZONE_HINT_RADIUS } from '../data/matchConfig'
import { PATROL_WAYPOINTS } from '../data/catcherConfig'
import { TRADE_ZONES } from '../data/mapConfig'
import type { Catcher } from '../entities/Catcher'
import type { CatcherSystem } from './CatcherSystem'

export class TraderSystem {
  private nextTraderAt = TRADER_INTERVAL_MS
  private currentZoneIndex = 0
  private traderZone?: Phaser.GameObjects.Arc
  private activeTrader: Catcher | null = null

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly catcherSystem: CatcherSystem,
  ) {}

  init(): void {
    this.traderZone = this.scene.add.circle(0, 0, TRADER_ZONE_HINT_RADIUS, 0x44ff88, 0.1)
    this.traderZone.setStrokeStyle(3, 0x44ff88, 0.45)
    this.traderZone.setDepth(1)
    this.traderZone.setVisible(false)
  }

  /** @returns true если торговец только что появился или сменился */
  update(elapsedMs: number): boolean {
    if (elapsedMs < this.nextTraderAt) return false

    this.nextTraderAt += TRADER_INTERVAL_MS
    this.spawnTrader()
    return true
  }

  getActiveTrader(): Catcher | null {
    return this.activeTrader
  }

  getTraderZoneHint(): { x: number; y: number; radius: number } | null {
    if (!this.activeTrader || !this.traderZone?.visible) return null

    const zone = TRADE_ZONES[this.currentZoneIndex]!
    return { x: zone.x, y: zone.y, radius: TRADER_ZONE_HINT_RADIUS }
  }

  private spawnTrader(): void {
    const previous = this.activeTrader
    const catchers = this.catcherSystem.catchers.filter((c) => !c.isTrader)
    if (catchers.length === 0) return

    const catcher = catchers[Math.floor(Math.random() * catchers.length)]!
    const zone = TRADE_ZONES[this.currentZoneIndex % TRADE_ZONES.length]!
    this.currentZoneIndex++

    this.catcherSystem.setTrader(catcher)
    this.activeTrader = catcher
    catcher.sprite.setPosition(zone.x, zone.y)
    catcher.body.reset(zone.x, zone.y)
    catcher.body.setVelocity(0, 0)

    if (this.traderZone) {
      this.traderZone.setPosition(zone.x, zone.y)
      this.traderZone.setVisible(true)
    }

    if (previous && previous !== catcher) {
      previous.waypointIndex = (previous.waypointIndex + 1) % PATROL_WAYPOINTS.length
    }
  }

  destroy(): void {
    this.traderZone?.destroy()
  }
}
