import Phaser from 'phaser'

import type { Boss } from '../entities/Boss'
import type { Enemy } from '../entities/Enemy'
import { ORBITAL_BASE, type OrbitalStats } from '../data/secondaryWeaponsConfig'
import type { EnemySpawnerSystem } from './EnemySpawnerSystem'

interface Blade {
  sprite: Phaser.GameObjects.Arc
  angle: number
}

export class OrbitalBladesSystem {
  private blades: Blade[] = []
  private stats: OrbitalStats = { ...ORBITAL_BASE }
  private active = false
  private readonly hitCooldowns = new Map<number, number>()

  constructor(private readonly scene: Phaser.Scene) {}

  enable(): void {
    this.active = true
    this.rebuildBlades()
  }

  addBlade(): void {
    this.stats.bladeCount = Math.min(6, this.stats.bladeCount + 1)
    this.rebuildBlades()
  }

  upgrade(): void {
    this.stats.damage = ORBITAL_BASE.damage * (1 + (this.stats.bladeCount - 2) * 0.15)
    this.stats.rotationSpeed = ORBITAL_BASE.rotationSpeed * 1.08
  }

  update(
    delta: number,
    playerX: number,
    playerY: number,
    time: number,
    enemies: Iterable<Enemy>,
    boss: Boss | null,
    spawner: EnemySpawnerSystem,
    onEnemyDamaged: (enemy: Enemy, damage: number) => void,
    onBossDamaged: (damage: number) => void,
    damageMultiplier: number,
  ): void {
    if (!this.active) return

    for (const blade of this.blades) {
      blade.angle += this.stats.rotationSpeed * delta
      blade.sprite.x = playerX + Math.cos(blade.angle) * this.stats.orbitRadius
      blade.sprite.y = playerY + Math.sin(blade.angle) * this.stats.orbitRadius
    }

    const damage = this.stats.damage * damageMultiplier

    for (const enemy of enemies) {
      if (!enemy.active) continue
      const enemyId = spawner.getEnemyId(enemy)

      for (const blade of this.blades) {
        const dist = Phaser.Math.Distance.Between(
          blade.sprite.x,
          blade.sprite.y,
          enemy.sprite.x,
          enemy.sprite.y,
        )
        if (dist > enemy.sprite.radius + 8) continue

        const nextHit = this.hitCooldowns.get(enemyId) ?? 0
        if (time < nextHit) continue

        this.hitCooldowns.set(enemyId, time + this.stats.hitCooldownMs)
        onEnemyDamaged(enemy, damage)
        break
      }
    }

    if (boss?.active) {
      const bossKey = -1
      const nextHit = this.hitCooldowns.get(bossKey) ?? 0
      if (time >= nextHit) {
        for (const blade of this.blades) {
          const dist = Phaser.Math.Distance.Between(
            blade.sprite.x,
            blade.sprite.y,
            boss.sprite.x,
            boss.sprite.y,
          )
          if (dist <= boss.sprite.radius + 8) {
            this.hitCooldowns.set(bossKey, time + this.stats.hitCooldownMs)
            onBossDamaged(damage)
            break
          }
        }
      }
    }
  }

  reset(): void {
    this.active = false
    this.stats = { ...ORBITAL_BASE, bladeCount: 2 }
    this.hitCooldowns.clear()
    for (const blade of this.blades) {
      blade.sprite.destroy()
    }
    this.blades = []
  }

  private rebuildBlades(): void {
    for (const blade of this.blades) {
      blade.sprite.destroy()
    }
    this.blades = []

    for (let i = 0; i < this.stats.bladeCount; i++) {
      const angle = (Math.PI * 2 * i) / this.stats.bladeCount
      const sprite = this.scene.add.circle(0, 0, 8, 0x66ffaa)
      sprite.setDepth(5)
      this.blades.push({ sprite, angle })
    }
  }
}
