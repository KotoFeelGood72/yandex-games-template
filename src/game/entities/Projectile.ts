import Phaser from 'phaser'

export class Projectile {
  readonly sprite: Phaser.GameObjects.Arc
  readonly body: Phaser.Physics.Arcade.Body

  active = false
  damage = 0
  pierceLeft = 0
  expiresAt = 0
  hitIds = new Set<number>()

  constructor(scene: Phaser.Scene) {
    this.sprite = scene.add.circle(0, 0, 5, 0xffe066)
    scene.physics.add.existing(this.sprite)
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body
    this.body.setCircle(5)
    this.sprite.setActive(false).setVisible(false)
  }

  fire(
    x: number,
    y: number,
    angle: number,
    speed: number,
    damage: number,
    pierce: number,
    lifetimeMs: number,
    now: number,
  ): void {
    this.active = true
    this.damage = damage
    this.pierceLeft = pierce
    this.expiresAt = now + lifetimeMs
    this.hitIds.clear()

    this.sprite.setPosition(x, y)
    this.sprite.setActive(true).setVisible(true)
    this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
  }

  reset(): void {
    this.active = false
    this.hitIds.clear()
    this.sprite.setActive(false).setVisible(false)
    this.body.setVelocity(0, 0)
  }

  isExpired(now: number): boolean {
    return now >= this.expiresAt
  }

  canHit(enemyId: number): boolean {
    return !this.hitIds.has(enemyId)
  }

  registerHit(enemyId: number): void {
    this.hitIds.add(enemyId)
    if (this.pierceLeft <= 0) {
      this.active = false
    } else {
      this.pierceLeft -= 1
    }
  }
}
