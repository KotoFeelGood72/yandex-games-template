import Phaser from 'phaser'

import type { StickKind } from '../data/stickConfig'
import { STICK_DEFINITIONS } from '../data/stickConfig'

let stickIdCounter = 0

export class Stick {
  readonly id: string
  kind: StickKind = 'neon'
  readonly sprite: Phaser.GameObjects.Image
  active = false
  respawnAt = 0

  constructor(scene: Phaser.Scene) {
    this.id = `stick-${stickIdCounter++}`
    const def = STICK_DEFINITIONS.neon

    this.sprite = scene.add.image(0, 0, def.textureKey)
    this.sprite.setDisplaySize(def.displaySize, def.displaySize)
    this.sprite.setDepth(2)
    this.sprite.setVisible(false)
    this.sprite.setActive(false)
  }

  spawn(x: number, y: number, kind: StickKind): void {
    this.kind = kind
    const def = STICK_DEFINITIONS[kind]

    this.sprite.setTexture(def.textureKey)
    this.sprite.setDisplaySize(def.displaySize, def.displaySize)
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
}
