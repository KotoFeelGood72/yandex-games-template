import { XPOrb } from '../entities/XPOrb'
import { ObjectPool } from '../utils/pool'
import type { PlayerConfig } from '../data/playerConfig'
import { applyLevelUp, UPGRADES, type UpgradeDefinition } from '../data/upgradesConfig'
import { calcXpToNextLevel } from '../data/playerConfig'
import { pickRandom } from '../utils/random'

export class XPSystem {
  private readonly pool: ObjectPool<XPOrb>

  constructor(scene: Phaser.Scene) {
    this.pool = new ObjectPool<XPOrb>(
      () => new XPOrb(scene),
      (orb) => orb.reset(),
      64,
    )
  }

  spawn(x: number, y: number, value: number): void {
    const orb = this.pool.acquire()
    orb.spawn(x, y, value)
  }

  update(
    delta: number,
    playerX: number,
    playerY: number,
    stats: PlayerConfig,
  ): UpgradeDefinition[] | null {
    for (const orb of this.pool.getActive()) {
      if (!orb.active) continue

      orb.update(delta, playerX, playerY, stats.pickupRadius)

      if (orb.isCollected(playerX, playerY)) {
        stats.xp += orb.value
        this.pool.release(orb)

        if (stats.xp >= stats.xpToNextLevel) {
          stats.xp -= stats.xpToNextLevel
          applyLevelUp(stats)
          return pickRandom(UPGRADES, 3)
        }
      }
    }

    return null
  }

  clear(): void {
    for (const orb of [...this.pool.getActive()]) {
      this.pool.release(orb)
    }
  }
}

export function ensureXpTarget(stats: PlayerConfig): void {
  stats.xpToNextLevel = calcXpToNextLevel(stats.level)
}
