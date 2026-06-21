import Phaser from 'phaser'

export class EnemyProjectile {
  readonly sprite: Phaser.GameObjects.Arc
  readonly body: Phaser.Physics.Arcade.Body

  active = false
  damage = 0
  expiresAt = 0

  constructor(scene: Phaser.Scene) {
    this.sprite = scene.add.circle(0, 0, 4, 0xff6688)
    scene.physics.add.existing(this.sprite)
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body
    this.body.setCircle(4)
    this.sprite.setActive(false).setVisible(false)
  }

  fire(
    x: number,
    y: number,
    angle: number,
    speed: number,
    damage: number,
    lifetimeMs: number,
    now: number,
  ): void {
    this.active = true
    this.damage = damage
    this.expiresAt = now + lifetimeMs
    this.sprite.setPosition(x, y)
    this.sprite.setActive(true).setVisible(true)
    this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
  }

  reset(): void {
    this.active = false
    this.sprite.setActive(false).setVisible(false)
    this.body.setVelocity(0, 0)
  }

  isExpired(now: number): boolean {
    return now >= this.expiresAt
  }
}
