import Phaser from 'phaser'

import type { Player } from '../entities/Player'

export class MatchInputSystem {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private keyW!: Phaser.Input.Keyboard.Key
  private keyA!: Phaser.Input.Keyboard.Key
  private keyS!: Phaser.Input.Keyboard.Key
  private keyD!: Phaser.Input.Keyboard.Key
  private keyE!: Phaser.Input.Keyboard.Key
  private keyShift!: Phaser.Input.Keyboard.Key
  private keyH!: Phaser.Input.Keyboard.Key

  private dashQueued = false
  private hideQueued = false

  constructor(private readonly scene: Phaser.Scene) {}

  init(): void {
    const keyboard = this.scene.input.keyboard
    if (!keyboard) return

    keyboard.enabled = true
    this.cursors = keyboard.createCursorKeys()
    this.keyW = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    this.keyA = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    this.keyS = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    this.keyD = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    this.keyE = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    this.keyShift = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
    this.keyH = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H)

    this.keyShift.on('down', () => {
      this.dashQueued = true
    })
    this.keyH.on('down', () => {
      this.hideQueued = true
    })
  }

  getMovementVector(): { x: number; y: number } {
    if (!this.cursors) return { x: 0, y: 0 }

    let x = 0
    let y = 0

    if (this.cursors.left.isDown || this.keyA.isDown) x -= 1
    if (this.cursors.right.isDown || this.keyD.isDown) x += 1
    if (this.cursors.up.isDown || this.keyW.isDown) y -= 1
    if (this.cursors.down.isDown || this.keyS.isDown) y += 1

    if (x !== 0 && y !== 0) {
      const len = Math.hypot(x, y)
      x /= len
      y /= len
    }

    return { x, y }
  }

  isInteractDown(): boolean {
    return this.keyE?.isDown ?? false
  }

  consumeDash(player: Player, time: number): boolean {
    if (!this.dashQueued) return false
    this.dashQueued = false
    return player.tryDash(time)
  }

  consumeHide(player: Player, time: number): boolean {
    if (!this.hideQueued) return false
    this.hideQueued = false
    return player.tryHide(time)
  }

  queueDash(): void {
    this.dashQueued = true
  }

  queueHide(): void {
    this.hideQueued = true
  }
}
