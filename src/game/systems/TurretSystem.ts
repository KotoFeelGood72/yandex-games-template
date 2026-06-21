import Phaser from 'phaser'

import type { Enemy } from '../entities/Enemy'
import type { Player } from '../entities/Player'
import type { Projectile } from '../entities/Projectile'
import { TURRET_BASE, type TurretStats } from '../data/secondaryWeaponsConfig'
import { ObjectPool } from '../utils/pool'
import { angleBetween } from '../utils/math'
import { AutoAimSystem } from './AutoAimSystem'

interface TurretSlot {
  sprite: Phaser.GameObjects.Rectangle
  angleOffset: number
}

export class TurretSystem {
  private readonly autoAim = new AutoAimSystem()
  private readonly slots: TurretSlot[] = []
  private stats: TurretStats = { ...TURRET_BASE }
  private fireCooldown = 0
  private active = false
  private level = 1

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly projectilePool: ObjectPool<Projectile>,
  ) {
    for (let i = 0; i < 2; i++) {
      const sprite = scene.add.rectangle(0, 0, 14, 14, 0x88ccff)
      sprite.setDepth(4)
      sprite.setVisible(false)
      this.slots.push({ sprite, angleOffset: i * Math.PI })
    }
  }

  enable(): void {
    this.active = true
    this.slots[0]!.sprite.setVisible(true)
  }

  upgrade(): void {
    this.level = Math.min(5, this.level + 1)
    this.stats.damage = TURRET_BASE.damage * (1 + (this.level - 1) * 0.18)
    this.stats.fireRate = Math.max(0.45, TURRET_BASE.fireRate * (1 - (this.level - 1) * 0.08))

    if (this.level >= 3 && this.slots[1]) {
      this.slots[1].sprite.setVisible(true)
    }
  }

  update(
    delta: number,
    player: Player,
    enemies: Iterable<Enemy>,
    damageMultiplier: number,
  ): void {
    if (!this.active) return

    const orbit = 56
    const time = this.scene.time.now / 1000

    for (const slot of this.slots) {
      if (!slot.sprite.visible) continue
      const a = time * 0.8 + slot.angleOffset
      slot.sprite.x = player.sprite.x + Math.cos(a) * orbit
      slot.sprite.y = player.sprite.y + Math.sin(a) * orbit
    }

    this.fireCooldown -= delta
    if (this.fireCooldown > 0) return

    for (const slot of this.slots) {
      if (!slot.sprite.visible) continue

      const target = this.autoAim.findNearest(enemies, slot.sprite.x, slot.sprite.y)
      if (!target) continue

      const dist = Phaser.Math.Distance.Between(
        slot.sprite.x,
        slot.sprite.y,
        target.sprite.x,
        target.sprite.y,
      )
      if (dist > this.stats.range) continue

      const angle = angleBetween(slot.sprite.x, slot.sprite.y, target.sprite.x, target.sprite.y)
      const projectile = this.projectilePool.acquire()
      projectile.fire(
        slot.sprite.x,
        slot.sprite.y,
        angle,
        this.stats.projectileSpeed,
        this.stats.damage * damageMultiplier,
        0,
        1200,
        this.scene.time.now,
      )
      projectile.sprite.setFillStyle(0x88ddff)
    }

    this.fireCooldown = this.stats.fireRate * 1000
  }

  reset(): void {
    this.active = false
    this.level = 1
    this.stats = { ...TURRET_BASE }
    this.fireCooldown = 0
    for (const slot of this.slots) {
      slot.sprite.setVisible(false)
    }
  }
}
