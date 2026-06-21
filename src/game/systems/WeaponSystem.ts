import type { Enemy } from '../entities/Enemy'
import type { Player } from '../entities/Player'
import type { Projectile } from '../entities/Projectile'
import type { WeaponConfig } from '../data/weaponsConfig'
import { ObjectPool } from '../utils/pool'
import { angleBetween } from '../utils/math'
import { AutoAimSystem } from './AutoAimSystem'

export class WeaponSystem {
  private readonly autoAim = new AutoAimSystem()
  private fireCooldown = 0

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly projectilePool: ObjectPool<Projectile>,
  ) {}

  update(
    delta: number,
    player: Player,
    weapon: WeaponConfig,
    enemies: Iterable<Enemy>,
  ): void {
    this.fireCooldown -= delta

    const interval = (weapon.fireRate / player.stats.fireRateMultiplier) * 1000
    if (this.fireCooldown > 0) return

    const target = this.autoAim.findNearest(enemies, player.sprite.x, player.sprite.y)
    if (!target) return

    const baseAngle = angleBetween(
      player.sprite.x,
      player.sprite.y,
      target.sprite.x,
      target.sprite.y,
    )

    const count = Math.max(1, weapon.projectileCount)
    const spread = weapon.spreadAngle
    const start = baseAngle - (spread * (count - 1)) / 2

    for (let i = 0; i < count; i++) {
      const angle = start + spread * i
      const projectile = this.projectilePool.acquire()
      projectile.fire(
        player.sprite.x,
        player.sprite.y,
        angle,
        weapon.projectileSpeed * player.stats.projectileSpeedMultiplier,
        weapon.damage * player.stats.damageMultiplier,
        weapon.pierce,
        weapon.projectileLifetime,
        this.scene.time.now,
      )
    }

    this.fireCooldown = interval
  }
}
