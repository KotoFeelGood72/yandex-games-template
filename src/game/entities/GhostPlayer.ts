import Phaser from 'phaser'

import { DEFAULT_MATCH_PLAYER } from '../data/playerConfig'
import type { TeamId } from '../data/mapConfig'
import { Player } from './Player'

export type MultiplayerEvent =
  | { type: 'move'; x: number; y: number; vx: number; vy: number }
  | { type: 'collect'; stickId: string }
  | { type: 'exchange'; traderId: string; amount: number }
  | { type: 'caught'; catcherId: string; lostNeon: number; lostSushi: number }
  | { type: 'dash'; x: number; y: number; dirX: number; dirY: number }
  | { type: 'hide'; x: number; y: number }
  | { type: 'score'; team: TeamId; score: number }

/** Воспроизведение записанной сессии противника */
export class GhostPlayer extends Player {
  readonly sessionId: string
  targetX = 0
  targetY = 0
  lerpSpeed = 6
  private readonly sceneRef: Phaser.Scene

  constructor(scene: Phaser.Scene, sessionId: string, team: TeamId, x: number, y: number) {
    super(scene, x, y, DEFAULT_MATCH_PLAYER, team, false)
    this.sceneRef = scene
    this.sessionId = sessionId
    this.sprite.setAlpha(0.7)
    this.targetX = x
    this.targetY = y
  }

  setTargetPosition(x: number, y: number, vx = 0, vy = 0): void {
    this.targetX = x
    this.targetY = y
    if (vx !== 0 || vy !== 0) {
      this.setMovement(vx, vy)
    }
  }

  updateGhost(deltaSec: number): void {
    const t = Phaser.Math.Clamp(this.lerpSpeed * deltaSec, 0, 1)
    this.sprite.x = Phaser.Math.Linear(this.sprite.x, this.targetX, t)
    this.sprite.y = Phaser.Math.Linear(this.sprite.y, this.targetY, t)
    this.body.center.set(this.sprite.x, this.sprite.y)
  }

  playCollectAnimation(): void {
    const scale = this.sprite.scaleX
    this.sprite.setScale(scale * 1.15)
    this.sceneRef.time.delayedCall(120, () => {
      if (this.sprite.active) {
        this.sprite.setScale(scale)
      }
    })
  }

  playCaughtAnimation(): void {
    this.sprite.setAlpha(0.35)
    this.sceneRef.time.delayedCall(400, () => {
      if (this.sprite.active) this.sprite.setAlpha(0.7)
    })
  }
}
