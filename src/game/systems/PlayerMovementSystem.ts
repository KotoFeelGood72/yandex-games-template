import Phaser from 'phaser'

import type { Player } from '../entities/Player'

export class PlayerMovementSystem {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private keyW!: Phaser.Input.Keyboard.Key
  private keyA!: Phaser.Input.Keyboard.Key
  private keyS!: Phaser.Input.Keyboard.Key
  private keyD!: Phaser.Input.Keyboard.Key

  constructor(private readonly scene: Phaser.Scene) {}

  init(): void {
    const keyboard = this.scene.input.keyboard
    if (!keyboard) return

    keyboard.enabled = true
    keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.S,
      Phaser.Input.Keyboard.KeyCodes.D,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
    ])

    this.cursors = keyboard.createCursorKeys()
    this.keyW = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    this.keyA = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    this.keyS = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    this.keyD = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
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

  update(player: Player): void {
    const movement = this.getMovementVector()
    player.setMovement(movement.x, movement.y)
  }
}
