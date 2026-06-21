import Phaser from 'phaser'

import { ARENA_BG_TEXTURE_KEY } from '../data/mapConfig'

const VIEW_PADDING = 128

export class InfiniteTilemapSystem {
  private readonly background: Phaser.GameObjects.TileSprite

  constructor(private readonly scene: Phaser.Scene) {
    const camera = scene.cameras.main
    const width = Math.max(camera.width, scene.scale.width) + VIEW_PADDING
    const height = Math.max(camera.height, scene.scale.height) + VIEW_PADDING

    this.background = scene.add.tileSprite(0, 0, width, height, ARENA_BG_TEXTURE_KEY)
    this.background.setDepth(-10)
    this.background.setOrigin(0.5)
  }

  update(camera: Phaser.Cameras.Scene2D.Camera): void {
    const view = camera.worldView

    this.background.setPosition(view.centerX, view.centerY)
    this.background.setSize(view.width + VIEW_PADDING, view.height + VIEW_PADDING)
    this.background.tilePositionX = camera.scrollX
    this.background.tilePositionY = camera.scrollY
  }
}
