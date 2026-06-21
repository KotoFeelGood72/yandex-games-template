import Phaser from 'phaser'

import type { MatchPlayerConfig, PlayerInventory } from '../data/playerConfig'
import { emptyInventory } from '../data/playerConfig'
import { getMapBounds, type TeamId } from '../data/mapConfig'
import {
  getIdleSpriteKey,
  getPlayerSpriteKey,
  getPrimaryDirection,
  PLAYER_SPRITE_HEIGHT,
  WALK_FRAME_MS,
  WALK_FRAME_SEQUENCE,
  type FacingDir,
  type WalkFrameIndex,
} from '../data/playerSpritesConfig'

export const PLAYER_HIT_RADIUS = 16

export class Player {
  readonly sprite: Phaser.GameObjects.Image
  readonly body: Phaser.Physics.Arcade.Body
  readonly radius = PLAYER_HIT_RADIUS
  readonly team: TeamId
  readonly isLocal: boolean

  stats: MatchPlayerConfig
  inventory: PlayerInventory = emptyInventory()

  invincibleUntil = 0
  moveX = 0
  moveY = 0

  dashCooldownUntil = 0
  dashActiveUntil = 0
  hideCooldownUntil = 0
  hideActiveUntil = 0
  exchangingUntil = 0

  private knockbackVx = 0
  private knockbackVy = 0
  private displayScale = 1
  private lastFacing: FacingDir = 'up'
  private walkSequenceIndex = 0
  private walkAnimElapsed = 0

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    stats: MatchPlayerConfig,
    team: TeamId,
    isLocal = true,
  ) {
    this.stats = stats
    this.team = team
    this.isLocal = isLocal

    const idleKey = getIdleSpriteKey(team, 'up')
    this.sprite = scene.add.image(x, y, idleKey)
    this.applyDisplaySize(idleKey)
    this.displayScale = this.sprite.scaleX
    this.sprite.setDepth(10)
    this.sprite.setRotation(0)

    scene.physics.add.existing(this.sprite)
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body
    this.body.setCircle(PLAYER_HIT_RADIUS)
    this.body.setImmovable(false)
    this.sprite.setData('participant', this)
    this.syncBodyFromSprite()
  }

  get x(): number {
    return this.sprite.x
  }

  get y(): number {
    return this.sprite.y
  }

  setMovement(x: number, y: number): void {
    this.moveX = x
    this.moveY = y
  }

  faceDirection(dirX: number, dirY: number): void {
    const facing = getPrimaryDirection(dirX, dirY)
    if (!facing) return

    this.lastFacing = facing
    this.walkSequenceIndex = 0
    this.walkAnimElapsed = 0
    this.setSprite(this.lastFacing, 0)
  }

  tryDash(time: number): boolean {
    if (time < this.dashCooldownUntil || time < this.exchangingUntil) return false
    if (this.moveX === 0 && this.moveY === 0) return false

    this.dashActiveUntil = time + this.stats.dashDurationMs
    this.dashCooldownUntil = time + 6000
    return true
  }

  tryHide(time: number): boolean {
    if (time < this.hideCooldownUntil || time < this.exchangingUntil) return false

    this.hideActiveUntil = time + 2000
    this.hideCooldownUntil = time + 12000
    return true
  }

  startExchange(time: number, durationMs: number): void {
    this.exchangingUntil = time + durationMs
  }

  cancelExchange(): void {
    this.exchangingUntil = 0
  }

  isExchanging(time: number): boolean {
    return time < this.exchangingUntil
  }

  isHidden(time: number): boolean {
    return time < this.hideActiveUntil
  }

  isInvincible(time: number): boolean {
    return time < this.invincibleUntil
  }

  applyInvincibility(time: number, durationMs: number): void {
    this.invincibleUntil = time + durationMs
  }

  applyKnockback(fromX: number, fromY: number, force: number): void {
    const angle = Phaser.Math.Angle.Between(fromX, fromY, this.x, this.y)
    this.knockbackVx += Math.cos(angle) * force
    this.knockbackVy += Math.sin(angle) * force
  }

  syncBodyFromSprite(): void {
    this.body.center.set(this.sprite.x, this.sprite.y)
    this.body.setVelocity(0, 0)
  }

  addStick(kind: keyof PlayerInventory, amount = 1): void {
    this.inventory[kind] += amount
  }

  update(time: number, delta = 16): void {
    const dt = delta / 1000
    const dashing = time < this.dashActiveUntil
    const speed = dashing ? this.stats.dashSpeed : this.stats.speed

    if (!this.isExchanging(time) && (this.moveX !== 0 || this.moveY !== 0)) {
      this.sprite.x += this.moveX * speed * dt
      this.sprite.y += this.moveY * speed * dt
    }

    if (Math.abs(this.knockbackVx) > 2 || Math.abs(this.knockbackVy) > 2) {
      this.sprite.x += this.knockbackVx * dt
      this.sprite.y += this.knockbackVy * dt
      const decay = Math.pow(0.04, dt)
      this.knockbackVx *= decay
      this.knockbackVy *= decay
    } else {
      this.knockbackVx = 0
      this.knockbackVy = 0
    }

    this.clampToMap()
    this.syncBodyFromSprite()

    this.updateSpriteAnimation(delta)

    const motionScale = this.moveX !== 0 || this.moveY !== 0 ? 1.03 : 1
    this.sprite.setScale(this.displayScale * motionScale)

    if (this.isInvincible(time)) {
      this.sprite.setAlpha(0.55)
    } else if (this.isHidden(time)) {
      this.sprite.setAlpha(0.35)
    } else {
      this.sprite.setAlpha(1)
    }
  }

  private clampToMap(): void {
    const bounds = getMapBounds()
    const r = PLAYER_HIT_RADIUS

    this.sprite.x = Phaser.Math.Clamp(this.sprite.x, bounds.left + r, bounds.right - r)
    this.sprite.y = Phaser.Math.Clamp(this.sprite.y, bounds.top + r, bounds.bottom - r)
  }

  private updateSpriteAnimation(delta: number): void {
    const moving =
      this.moveX !== 0 ||
      this.moveY !== 0 ||
      Math.abs(this.knockbackVx) > 8 ||
      Math.abs(this.knockbackVy) > 8
    const direction = getPrimaryDirection(this.moveX, this.moveY)

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
    const key = getPlayerSpriteKey(this.team, dir, frame)
    if (this.sprite.texture.key !== key) {
      this.sprite.setTexture(key)
      this.applyDisplaySize(key)
    }
  }

  private applyDisplaySize(textureKey: string): void {
    const tex = this.sprite.scene.textures.get(textureKey)
    const source = tex.getSourceImage() as { width: number; height: number }
    const scale = PLAYER_SPRITE_HEIGHT / source.height
    this.sprite.setDisplaySize(source.width * scale, PLAYER_SPRITE_HEIGHT)
    this.displayScale = this.sprite.scaleX
  }
}
