import Phaser from 'phaser'

import {
  DECORATOR_DEPTH,
  DECORATOR_DISPLAY_HEIGHT,
  DECORATOR_MAP_MARGIN,
  DECORATOR_MIN_SPACING,
  DECORATOR_SPAWN_COUNT,
  getDecoratorTextureKey,
  pickRandomDecoratorId,
} from '../data/decoratorConfig'
import { getMapBounds } from '../data/mapConfig'
import { distance } from '../utils/math'
import { randomRange } from '../utils/random'

const SPAWN_ATTEMPTS = 24

export class DecoratorSystem {
  private readonly sprites: Phaser.GameObjects.Image[] = []
  private readonly bounds = getMapBounds()

  constructor(private readonly scene: Phaser.Scene) {
    this.spawnAll()
  }

  destroy(): void {
    for (const sprite of this.sprites) {
      sprite.destroy()
    }
    this.sprites.length = 0
  }

  private spawnAll(): void {
    const placed: Array<{ x: number; y: number }> = []

    for (let i = 0; i < DECORATOR_SPAWN_COUNT; i++) {
      const pos = this.findPosition(placed)
      if (!pos) continue

      const textureId = pickRandomDecoratorId()
      const key = getDecoratorTextureKey(textureId)
      if (!this.scene.textures.exists(key)) continue

      const sprite = this.scene.add.image(pos.x, pos.y, key)
      this.applyDisplaySize(sprite, key)

      const scaleJitter = randomRange(0.88, 1.12)
      sprite.setScale(sprite.scaleX * scaleJitter, sprite.scaleY * scaleJitter)
      sprite.setDepth(DECORATOR_DEPTH)
      sprite.setRotation(randomRange(-0.08, 0.08))

      this.sprites.push(sprite)
      placed.push(pos)
    }
  }

  private findPosition(
    placed: Array<{ x: number; y: number }>,
  ): { x: number; y: number } | null {
    for (let attempt = 0; attempt < SPAWN_ATTEMPTS; attempt++) {
      const x = randomRange(
        this.bounds.left + DECORATOR_MAP_MARGIN,
        this.bounds.right - DECORATOR_MAP_MARGIN,
      )
      const y = randomRange(
        this.bounds.top + DECORATOR_MAP_MARGIN,
        this.bounds.bottom - DECORATOR_MAP_MARGIN,
      )

      const tooClose = placed.some((point) => distance(x, y, point.x, point.y) < DECORATOR_MIN_SPACING)
      if (!tooClose) {
        return { x, y }
      }
    }

    return null
  }

  private applyDisplaySize(sprite: Phaser.GameObjects.Image, textureKey: string): void {
    const tex = this.scene.textures.get(textureKey)
    const source = tex.getSourceImage() as { width: number; height: number }
    const scale = DECORATOR_DISPLAY_HEIGHT / source.height
    sprite.setDisplaySize(source.width * scale, DECORATOR_DISPLAY_HEIGHT)
  }
}
