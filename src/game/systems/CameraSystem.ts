import Phaser from 'phaser'

import type { ArenaBounds } from '../data/mapConfig'
import type { Player } from '../entities/Player'

/** Отступ от края экрана — игрок не уходит за камеру */
const PLAYER_VIEW_PADDING = 48

export class CameraSystem {
  private readonly camera: Phaser.Cameras.Scene2D.Camera
  private bounds: ArenaBounds | null = null
  private followPlayer: Player | null = null
  private fixedCenter: { x: number; y: number } | null = null

  constructor(scene: Phaser.Scene) {
    this.camera = scene.cameras.main
    this.camera.setBackgroundColor(0x1a1814)
  }

  setBounds(arena: { bounds: ArenaBounds }): void {
    this.bounds = arena.bounds
    this.camera.setZoom(1)
  }

  centerOn(x: number, y: number): void {
    this.followPlayer = null
    this.fixedCenter = { x, y }
    this.applyScroll(x, y)
  }

  follow(player: Player): void {
    this.fixedCenter = null
    this.followPlayer = player
    this.applyScroll(player.x, player.y)
  }

  update(): void {
    if (this.followPlayer) {
      this.applyScroll(this.followPlayer.x, this.followPlayer.y)
      return
    }

    if (this.fixedCenter) {
      this.applyScroll(this.fixedCenter.x, this.fixedCenter.y)
    }
  }

  private applyScroll(targetX: number, targetY: number): void {
    const cam = this.camera
    const halfW = cam.width / 2
    const halfH = cam.height / 2

    let scrollX = targetX - halfW
    let scrollY = targetY - halfH

    const bounds = this.bounds
    if (!bounds) {
      cam.setScroll(scrollX, scrollY)
      return
    }

    const minScrollX = bounds.left
    const maxScrollX = bounds.right - cam.width
    const minScrollY = bounds.top
    const maxScrollY = bounds.bottom - cam.height

    if (maxScrollX >= minScrollX) {
      scrollX = Phaser.Math.Clamp(scrollX, minScrollX, maxScrollX)
    } else {
      scrollX = (bounds.left + bounds.right) / 2 - halfW
    }

    if (maxScrollY >= minScrollY) {
      scrollY = Phaser.Math.Clamp(scrollY, minScrollY, maxScrollY)
    } else {
      scrollY = (bounds.top + bounds.bottom) / 2 - halfH
    }

    const pad = PLAYER_VIEW_PADDING

    if (targetX - pad < scrollX) {
      scrollX = targetX - pad
    } else if (targetX + pad > scrollX + cam.width) {
      scrollX = targetX + pad - cam.width
    }

    if (targetY - pad < scrollY) {
      scrollY = targetY - pad
    } else if (targetY + pad > scrollY + cam.height) {
      scrollY = targetY + pad - cam.height
    }

    if (maxScrollX >= minScrollX) {
      scrollX = Phaser.Math.Clamp(scrollX, minScrollX, maxScrollX)
    }

    if (maxScrollY >= minScrollY) {
      scrollY = Phaser.Math.Clamp(scrollY, minScrollY, maxScrollY)
    }

    cam.setScroll(scrollX, scrollY)
  }
}
