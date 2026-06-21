import Phaser from 'phaser'

import { STICK_PICKUP_RADIUS } from '../data/matchConfig'
import { Stick } from '../entities/Stick'
import type { Player } from '../entities/Player'
import type { BotPlayer } from '../entities/BotPlayer'
import { ObjectPool } from '../utils/pool'
import { randomRange } from '../utils/random'

interface DroppedStick {
  stick: Stick
  neon: number
  sushi: number
}

export class DropSystem {
  private readonly pool: ObjectPool<Stick>
  private readonly drops: DroppedStick[] = []

  constructor(private readonly scene: Phaser.Scene) {
    this.pool = new ObjectPool<Stick>(
      () => new Stick(scene),
      (s) => s.reset(),
      32,
    )
  }

  scatter(x: number, y: number, neon: number, sushi: number): void {
    if (neon + sushi <= 0) return

    const total = neon + sushi
    let index = 0

    for (let i = 0; i < neon; i++) {
      this.spawnDrop(x, y, 'neon', index, total)
      index++
    }
    for (let i = 0; i < sushi; i++) {
      this.spawnDrop(x, y, 'sushi', index, total)
      index++
    }
  }

  update(collectors: Array<Player | BotPlayer>): void {
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i]!
      if (!drop.stick.active) {
        this.drops.splice(i, 1)
        continue
      }

      for (const collector of collectors) {
        const dist = Phaser.Math.Distance.Between(
          collector.x,
          collector.y,
          drop.stick.x,
          drop.stick.y,
        )
        if (dist <= STICK_PICKUP_RADIUS) {
          if (drop.neon > 0) collector.addStick('neon', drop.neon)
          if (drop.sushi > 0) collector.addStick('sushi', drop.sushi)
          drop.stick.despawn()
          this.pool.release(drop.stick)
          this.drops.splice(i, 1)
          break
        }
      }
    }
  }

  private spawnDrop(
    originX: number,
    originY: number,
    kind: 'neon' | 'sushi',
    index: number,
    total: number,
  ): void {
    const stick = this.pool.acquire()
    const angle = (index / total) * Math.PI * 2 + randomRange(-0.2, 0.2)
    const dist = randomRange(40, 110)
    stick.spawn(
      originX + Math.cos(angle) * dist,
      originY + Math.sin(angle) * dist,
      kind,
    )
    this.drops.push({ stick, neon: kind === 'neon' ? 1 : 0, sushi: kind === 'sushi' ? 1 : 0 })
  }
}
