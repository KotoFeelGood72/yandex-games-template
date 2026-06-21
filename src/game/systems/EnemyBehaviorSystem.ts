import type { Enemy } from '../entities/Enemy'
import { angleBetween } from '../utils/math'
import type { ArenaSystem } from './ArenaSystem'

const SHOOTER_FIRE_INTERVAL = 1600
const SHOOTER_MIN_DISTANCE = 170
const SHOOTER_MAX_DISTANCE = 240
const SHOOTER_PROJECTILE_SPEED = 200

export type FireEnemyProjectile = (
  x: number,
  y: number,
  angle: number,
  speed: number,
  damage: number,
) => void

export class EnemyBehaviorSystem {
  constructor(
    private readonly fireProjectile: FireEnemyProjectile,
    private readonly arena: ArenaSystem | null = null,
  ) {}

  update(enemies: Iterable<Enemy>, playerX: number, playerY: number, delta: number): void {
    for (const enemy of enemies) {
      if (!enemy.active) continue

      switch (enemy.typeId) {
        case 'shooter':
          this.updateShooter(enemy, playerX, playerY, delta)
          break
        default:
          enemy.chase(playerX, playerY)
      }

      enemy.recoverScale()
      enemy.syncHpBar()

      if (this.arena) {
        this.arena.clampBody(enemy.body, enemy.sprite.radius)
      }
    }
  }

  private updateShooter(
    enemy: Enemy,
    playerX: number,
    playerY: number,
    delta: number,
  ): void {
    const dx = playerX - enemy.sprite.x
    const dy = playerY - enemy.sprite.y
    const dist = Math.hypot(dx, dy) || 1
    const nx = dx / dist
    const ny = dy / dist

    if (dist < SHOOTER_MIN_DISTANCE) {
      enemy.body.setVelocity(-nx * enemy.speed, -ny * enemy.speed)
    } else if (dist > SHOOTER_MAX_DISTANCE) {
      enemy.body.setVelocity(nx * enemy.speed, ny * enemy.speed)
    } else {
      enemy.body.setVelocity(0, 0)
    }

    enemy.shootCooldownMs -= delta
    if (enemy.shootCooldownMs > 0) return

    const angle = angleBetween(enemy.sprite.x, enemy.sprite.y, playerX, playerY)
    this.fireProjectile(
      enemy.sprite.x,
      enemy.sprite.y,
      angle,
      SHOOTER_PROJECTILE_SPEED,
      enemy.damage,
    )
    enemy.shootCooldownMs = SHOOTER_FIRE_INTERVAL
  }
}
