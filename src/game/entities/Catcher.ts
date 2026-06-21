import Phaser from 'phaser'

import type { CatcherDefinition } from '../data/catcherConfig'
import {
  CATCHER_HIT_RADIUS,
  CATCHER_SPRITE_HEIGHT,
  getCatcherIdleSpriteKey,
  getCatcherSpriteKey,
  getPrimaryDirection,
  WALK_FRAME_MS,
  WALK_FRAME_SEQUENCE,
  type FacingDir,
  type WalkFrameIndex,
} from '../data/catcherSpritesConfig'
import type { Player } from './Player'
import type { BotPlayer } from './BotPlayer'

export type CatcherState = 'patrol' | 'chase' | 'trader'

export class Catcher {
  readonly def: CatcherDefinition
  readonly sprite: Phaser.GameObjects.Image
  readonly body: Phaser.Physics.Arcade.Body

  state: CatcherState = 'patrol'
  waypointIndex = 0
  chaseUntil = 0
  chaseTarget: Player | BotPlayer | null = null
  catchCooldownUntil = 0
  isTrader = false

  private traderGlow?: Phaser.GameObjects.Arc
  private readonly scene: Phaser.Scene
  private displayScale = 1
  private lastFacing: FacingDir = 'down'
  private walkSequenceIndex = 0
  private walkAnimElapsed = 0

  constructor(scene: Phaser.Scene, def: CatcherDefinition, x: number, y: number) {
    this.scene = scene
    this.def = def

    const idleKey = getCatcherIdleSpriteKey('down')
    this.sprite = scene.add.image(x, y, idleKey)
    this.applyDisplaySize(idleKey)
    this.displayScale = this.sprite.scaleX
    this.sprite.setDepth(8)

    scene.physics.add.existing(this.sprite)
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body
    this.body.setCircle(CATCHER_HIT_RADIUS)
    this.body.setImmovable(true)
  }

  get x(): number {
    return this.sprite.x
  }

  get y(): number {
    return this.sprite.y
  }

  update(delta = 16): void {
    this.updateSpriteAnimation(delta)
  }

  setTrader(active: boolean): void {
    this.isTrader = active
    this.state = active ? 'trader' : 'patrol'

    if (active) {
      this.traderGlow?.destroy()
      this.traderGlow = this.scene.add.circle(this.x, this.y, 42, 0x44ff88, 0.2)
      this.traderGlow.setDepth(7)
      this.sprite.setTint(0x88ffbb)
    } else {
      this.traderGlow?.destroy()
      this.traderGlow = undefined
      this.sprite.clearTint()
    }
  }

  syncTraderGlow(): void {
    if (this.traderGlow) {
      this.traderGlow.setPosition(this.x, this.y)
    }
  }

  destroy(): void {
    this.traderGlow?.destroy()
    this.sprite.destroy()
  }

  private updateSpriteAnimation(delta: number): void {
    const vx = this.body.velocity.x
    const vy = this.body.velocity.y
    const moving = Math.abs(vx) > 1 || Math.abs(vy) > 1
    const direction = getPrimaryDirection(vx, vy)

    if (direction) {
      this.lastFacing = direction
    }

    if (moving) {
      this.walkAnimElapsed += delta

      if (this.walkAnimElapsed >= WALK_FRAME_MS) {
        this.walkAnimElapsed = 0
        this.walkSequenceIndex = (this.walkSequenceIndex + 1) % WALK_FRAME_SEQUENCE.length
      }

      const frame = WALK_FRAME_SEQUENCE[this.walkSequenceIndex]!
      this.setSprite(this.lastFacing, frame)
      return
    }

    this.walkSequenceIndex = 0
    this.walkAnimElapsed = 0
    this.setSprite(this.lastFacing, 0)
  }

  private setSprite(dir: FacingDir, frame: WalkFrameIndex): void {
    const key = getCatcherSpriteKey(dir, frame)
    if (this.sprite.texture.key !== key) {
      this.sprite.setTexture(key)
      this.applyDisplaySize(key)
    }
  }

  private applyDisplaySize(textureKey: string): void {
    const tex = this.sprite.scene.textures.get(textureKey)
    const source = tex.getSourceImage() as { width: number; height: number }
    const scale = CATCHER_SPRITE_HEIGHT / source.height
    this.sprite.setDisplaySize(source.width * scale, CATCHER_SPRITE_HEIGHT)
    this.displayScale = this.sprite.scaleX
  }
}
