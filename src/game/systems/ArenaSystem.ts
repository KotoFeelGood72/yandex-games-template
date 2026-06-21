import Phaser from 'phaser'

import { getMapBounds } from '../data/mapConfig'

export class ArenaSystem {
  readonly bounds = getMapBounds()
  private readonly border: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    scene.physics.world.setBounds(
      this.bounds.left,
      this.bounds.top,
      this.bounds.width,
      this.bounds.height,
    )

    this.border = scene.add.graphics()
    this.border.setDepth(-5)
    this.drawBorder()
  }

  clampBody(body: Phaser.Physics.Arcade.Body, radius: number): void {
    const nextX = Phaser.Math.Clamp(
      body.center.x,
      this.bounds.left + radius,
      this.bounds.right - radius,
    )
    const nextY = Phaser.Math.Clamp(
      body.center.y,
      this.bounds.top + radius,
      this.bounds.bottom - radius,
    )
    body.center.set(nextX, nextY)
  }

  getSpawnBounds(camera: Phaser.Cameras.Scene2D.Camera, padding: number) {
    const view = camera.worldView
    return {
      left: Math.max(this.bounds.left + 16, view.left - padding),
      top: Math.max(this.bounds.top + 16, view.top - padding),
      right: Math.min(this.bounds.right - 16, view.right + padding),
      bottom: Math.min(this.bounds.bottom - 16, view.bottom + padding),
      width: 0,
      height: 0,
      centerX: 0,
      centerY: 0,
    }
  }

  private drawBorder(): void {
    this.border.clear()
    this.border.lineStyle(2, 0x00f5ff, 0.35)
    this.border.strokeRect(
      this.bounds.left,
      this.bounds.top,
      this.bounds.width,
      this.bounds.height,
    )
  }
}
