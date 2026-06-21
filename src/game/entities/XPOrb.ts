import Phaser from 'phaser'

export class XPOrb {
  readonly sprite: Phaser.GameObjects.Arc

  active = false
  value = 0
  magnetized = false

  constructor(scene: Phaser.Scene) {
    this.sprite = scene.add.circle(0, 0, 6, 0x66ff99)
    this.sprite.setActive(false).setVisible(false)
  }

  spawn(x: number, y: number, value: number): void {
    this.active = true
    this.value = value
    this.magnetized = false
    this.sprite.setPosition(x, y)
    this.sprite.setActive(true).setVisible(true)
  }

  reset(): void {
    this.active = false
    this.magnetized = false
    this.sprite.setActive(false).setVisible(false)
  }

  update(delta: number, playerX: number, playerY: number, pickupRadius: number): void {
    if (!this.active) return

    const dx = playerX - this.sprite.x
    const dy = playerY - this.sprite.y
    const dist = Math.hypot(dx, dy)

    if (dist <= pickupRadius) {
      this.magnetized = true
    }

    if (this.magnetized && dist > 4) {
      const speed = 320
      const step = (speed * delta) / 1000
      const ratio = Math.min(1, step / dist)
      this.sprite.x += dx * ratio
      this.sprite.y += dy * ratio
    }
  }

  isCollected(playerX: number, playerY: number): boolean {
    const dist = Math.hypot(playerX - this.sprite.x, playerY - this.sprite.y)
    return dist <= 14
  }
}
