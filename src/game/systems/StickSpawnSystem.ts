import Phaser from 'phaser'

import { CENTER_ZONE, getMapBounds } from '../data/mapConfig'
import { STICK_PICKUP_RADIUS, STICK_RESPAWN_MS } from '../data/matchConfig'
import { CENTER_SPAWN_CHANCE, MAX_NEON_STICKS_ON_MAP } from '../data/stickConfig'
import { Stick } from '../entities/Stick'
import type { Player } from '../entities/Player'
import type { BotPlayer } from '../entities/BotPlayer'
import { distance } from '../utils/math'
import { ObjectPool } from '../utils/pool'
import { randomRange } from '../utils/random'

const MIN_STICK_SPACING = 44
const SPAWN_ATTEMPTS = 18
const MAP_MARGIN = 100

export class StickSpawnSystem {
  private readonly pool: ObjectPool<Stick>
  private readonly bounds = getMapBounds()
  private goldenSpawned = false

  constructor(private readonly scene: Phaser.Scene) {
    this.pool = new ObjectPool<Stick>(
      () => new Stick(scene),
      (stick) => stick.reset(),
      MAX_NEON_STICKS_ON_MAP + 8,
    )
  }

  initMap(): void {
    for (let i = 0; i < MAX_NEON_STICKS_ON_MAP; i++) {
      this.spawnNeonAtRandom()
    }
  }

  spawnGoldenOnce(): Stick | null {
    if (this.goldenSpawned) return null
    this.goldenSpawned = true

    const stick = this.pool.acquire()
    const pos = this.findSpawnPosition()
    stick.spawn(pos.x, pos.y, 'golden')
    return stick
  }

  getActiveSticks(): Stick[] {
    return [...this.pool.getActive()]
  }

  update(
    time: number,
    collectors: Array<Player | BotPlayer>,
    onCollect: (collector: Player | BotPlayer, stick: Stick) => void,
  ): void {
    for (const stick of this.pool.getActive()) {
      if (!stick.active) continue

      for (const collector of collectors) {
        if (distance(collector.x, collector.y, stick.x, stick.y) <= STICK_PICKUP_RADIUS) {
          onCollect(collector, stick)
          stick.despawn(STICK_RESPAWN_MS, time)
          break
        }
      }
    }

    for (const stick of this.pool.getAll()) {
      if (!stick.active && stick.respawnAt > 0 && time >= stick.respawnAt) {
        stick.respawnAt = 0
        const pos = this.findSpawnPosition()
        stick.spawn(pos.x, pos.y, 'neon')
      }
    }
  }

  private spawnNeonAtRandom(): void {
    const stick = this.pool.acquire()
    const pos = this.findSpawnPosition()
    stick.spawn(pos.x, pos.y, 'neon')
  }

  private findSpawnPosition(): { x: number; y: number } {
    for (let attempt = 0; attempt < SPAWN_ATTEMPTS; attempt++) {
      const pos = this.randomPosition()
      if (this.hasSpacing(pos.x, pos.y)) {
        return pos
      }
    }

    return this.randomPosition()
  }

  private hasSpacing(x: number, y: number): boolean {
    for (const stick of this.pool.getActive()) {
      if (!stick.active) continue
      if (distance(x, y, stick.x, stick.y) < MIN_STICK_SPACING) {
        return false
      }
    }
    return true
  }

  private randomPosition(): { x: number; y: number } {
    if (Math.random() < CENTER_SPAWN_CHANCE) {
      const angle = Math.random() * Math.PI * 2
      const r = randomRange(60, CENTER_ZONE.radius)
      return {
        x: CENTER_ZONE.x + Math.cos(angle) * r,
        y: CENTER_ZONE.y + Math.sin(angle) * r,
      }
    }

    return {
      x: randomRange(this.bounds.left + MAP_MARGIN, this.bounds.right - MAP_MARGIN),
      y: randomRange(this.bounds.top + MAP_MARGIN, this.bounds.bottom - MAP_MARGIN),
    }
  }
}
