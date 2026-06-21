import Phaser from 'phaser'

import type { Boss } from '../entities/Boss'
import type { Enemy } from '../entities/Enemy'
import type { EnemyProjectile } from '../entities/EnemyProjectile'
import type { Player } from '../entities/Player'
import type { Projectile } from '../entities/Projectile'
import { ObjectPool } from '../utils/pool'
import type { EnemySpawnerSystem } from './EnemySpawnerSystem'

export class CollisionSystem {
  constructor(
    private readonly spawner: EnemySpawnerSystem,
    private readonly projectilePool: ObjectPool<Projectile>,
    private readonly enemyProjectilePool: ObjectPool<EnemyProjectile>,
    private readonly onEnemyHit: (enemy: Enemy, projectile: Projectile) => void,
    private readonly onBossHit: (projectile: Projectile) => void,
    private readonly onEnemyTouchPlayer: (enemy: Enemy) => void,
    private readonly onEnemyProjectileHitPlayer: (projectile: EnemyProjectile) => void,
  ) {}

  update(
    player: Player,
    projectiles: Iterable<Projectile>,
    enemies: Iterable<Enemy>,
    enemyProjectiles: Iterable<EnemyProjectile>,
    boss: Boss | null,
    time: number,
  ): void {
    for (const projectile of projectiles) {
      if (!projectile.active) continue

      let hit = false

      if (boss?.active) {
        if (
          Phaser.Math.Distance.Between(
            projectile.sprite.x,
            projectile.sprite.y,
            boss.sprite.x,
            boss.sprite.y,
          ) <= boss.sprite.radius + 5
        ) {
          this.onBossHit(projectile)
          this.projectilePool.release(projectile)
          hit = true
        }
      }

      if (hit) continue

      for (const enemy of enemies) {
        if (!enemy.active) continue

        const enemyId = this.spawner.getEnemyId(enemy)
        if (!projectile.canHit(enemyId)) continue

        if (
          Phaser.Math.Distance.Between(
            projectile.sprite.x,
            projectile.sprite.y,
            enemy.sprite.x,
            enemy.sprite.y,
          ) <= enemy.sprite.radius + 5
        ) {
          this.onEnemyHit(enemy, projectile)
          projectile.registerHit(enemyId)
          if (!projectile.active) {
            this.projectilePool.release(projectile)
          }
          break
        }
      }
    }

    for (const enemy of enemies) {
      if (!enemy.active) continue

      if (
        Phaser.Math.Distance.Between(
          player.sprite.x,
          player.sprite.y,
          enemy.sprite.x,
          enemy.sprite.y,
        ) <= player.radius + enemy.sprite.radius
      ) {
        this.onEnemyTouchPlayer(enemy)
      }
    }

    if (boss?.active) {
      if (
        Phaser.Math.Distance.Between(
          player.sprite.x,
          player.sprite.y,
          boss.sprite.x,
          boss.sprite.y,
        ) <= player.radius + boss.sprite.radius
      ) {
        if (player.takeDamage(boss.damage, time)) {
          // урон применён
        }
      }
    }

    for (const projectile of enemyProjectiles) {
      if (!projectile.active) continue

      if (
        Phaser.Math.Distance.Between(
          player.sprite.x,
          player.sprite.y,
          projectile.sprite.x,
          projectile.sprite.y,
        ) <= player.radius + 4
      ) {
        this.onEnemyProjectileHitPlayer(projectile)
        this.enemyProjectilePool.release(projectile)
      }
    }
  }
}
