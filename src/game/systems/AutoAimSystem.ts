import type { Enemy } from '../entities/Enemy'
import { distance } from '../utils/math'

export class AutoAimSystem {
  findNearest(enemies: Iterable<Enemy>, x: number, y: number): Enemy | null {
    let nearest: Enemy | null = null
    let nearestDist = Number.POSITIVE_INFINITY

    for (const enemy of enemies) {
      if (!enemy.active) continue
      const dist = distance(x, y, enemy.sprite.x, enemy.sprite.y)
      if (dist < nearestDist) {
        nearestDist = dist
        nearest = enemy
      }
    }

    return nearest
  }
}
