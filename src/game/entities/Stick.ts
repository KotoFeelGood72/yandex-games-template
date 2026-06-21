import Phaser from 'phaser'

import {
  NEON_DISPLAY_HEIGHT,
  NEON_HORIZONTAL_DISPLAY_WIDTH,
  getNeonTextureKey,
  isHorizontalNeonVariant,
  pickRandomNeonVariant,
} from '../data/neonStickConfig'
import type { StickKind } from '../data/stickConfig'
import { STICK_DEFINITIONS } from '../data/stickConfig'

let stickIdCounter = 0

export class Stick {
  readonly id: string
  kind: StickKind = 'neon'
  readonly sprite: Phaser.GameObjects.Image
  active = false
  respawnAt = 0
  neonVariant = 1

  constructor(scene: Phaser.Scene) {
    this.id = `stick-${stickIdCounter++}`

    this.sprite = scene.add.image(0, 0, getNeonTextureKey(1))
    this.applyNeonDisplaySize(getNeonTextureKey(1), 1)
    this.sprite.setDepth(2)
    this.sprite.setVisible(false)
    this.sprite.setActive(false)
  }

  spawn(x: number, y: number, kind: StickKind): void {
    this.kind = kind

    if (kind === 'neon') {
      this.neonVariant = pickRandomNeonVariant()
      const key = getNeonTextureKey(this.neonVariant)
      this.sprite.setTexture(key)
      this.applyNeonDisplaySize(key, this.neonVariant)
    } else {
      const def = STICK_DEFINITIONS[kind]
      this.sprite.setTexture(def.textureKey)
      this.sprite.setDisplaySize(def.displaySize, def.displaySize)
    }

    this.sprite.setPosition(x, y)
    this.sprite.setVisible(true)
    this.sprite.setActive(true)
    this.active = true
    this.respawnAt = 0
  }

  despawn(respawnDelayMs = 0, now = 0): void {
    this.active = false
    this.sprite.setVisible(false)
    this.sprite.setActive(false)
    if (respawnDelayMs > 0) {
      this.respawnAt = now + respawnDelayMs
    }
  }

  get x(): number {
    return this.sprite.x
  }

  get y(): number {
    return this.sprite.y
  }

  reset(): void {
    this.despawn()
    this.respawnAt = 0
  }

  private applyNeonDisplaySize(textureKey: string, variantId: number): void {
    const tex = this.sprite.scene.textures.get(textureKey)
    const source = tex.getSourceImage() as { width: number; height: number }

    if (isHorizontalNeonVariant(variantId) || source.width > source.height * 1.35) {
      const scale = NEON_HORIZONTAL_DISPLAY_WIDTH / source.width
      this.sprite.setDisplaySize(
        NEON_HORIZONTAL_DISPLAY_WIDTH,
        source.height * scale,
      )
      return
    }

    const scale = NEON_DISPLAY_HEIGHT / source.height
    this.sprite.setDisplaySize(source.width * scale, NEON_DISPLAY_HEIGHT)
  }
}
