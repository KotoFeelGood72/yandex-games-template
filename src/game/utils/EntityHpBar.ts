import Phaser from 'phaser'

export interface EntityHpBarOptions {
  widthFactor?: number
  height?: number
  offsetY?: number
  depth?: number
}

export class EntityHpBar {
  private readonly bg: Phaser.GameObjects.Rectangle
  private readonly fill: Phaser.GameObjects.Rectangle
  private readonly height: number
  private readonly offsetY: number
  private readonly widthFactor: number
  private barWidth = 24
  private visible = false

  constructor(scene: Phaser.Scene, options: EntityHpBarOptions = {}) {
    this.widthFactor = options.widthFactor ?? 1.5
    this.height = options.height ?? 4
    this.offsetY = options.offsetY ?? 6
    const depth = options.depth ?? 10

    this.bg = scene.add.rectangle(0, 0, this.barWidth, this.height, 0x111111, 0.85)
    this.fill = scene.add.rectangle(0, 0, this.barWidth, this.height, 0x5dff7a)

    this.bg.setDepth(depth).setOrigin(0.5, 0.5)
    this.fill.setDepth(depth + 0.1).setOrigin(0, 0.5)

    this.hide()
  }

  attach(radius: number): void {
    this.barWidth = Math.max(18, Math.round(radius * 2 * this.widthFactor))
    this.bg.setSize(this.barWidth, this.height)
    this.show()
  }

  sync(x: number, y: number, radius: number, hp: number, maxHp: number): void {
    if (!this.visible) return

    const yPos = y - radius - this.offsetY
    this.bg.setPosition(x, yPos)

    const ratio = maxHp > 0 ? Phaser.Math.Clamp(hp / maxHp, 0, 1) : 0
    const fillWidth = Math.max(0, this.barWidth * ratio)

    this.fill.setPosition(x - this.barWidth / 2, yPos)
    this.fill.displayWidth = fillWidth
    this.fill.displayHeight = this.height

    if (ratio > 0.5) {
      this.fill.setFillStyle(0x5dff7a)
    } else if (ratio > 0.25) {
      this.fill.setFillStyle(0xffd54a)
    } else {
      this.fill.setFillStyle(0xff5555)
    }
  }

  show(): void {
    this.visible = true
    this.bg.setVisible(true)
    this.fill.setVisible(true)
  }

  hide(): void {
    this.visible = false
    this.bg.setVisible(false)
    this.fill.setVisible(false)
  }

  destroy(): void {
    this.bg.destroy()
    this.fill.destroy()
  }
}
