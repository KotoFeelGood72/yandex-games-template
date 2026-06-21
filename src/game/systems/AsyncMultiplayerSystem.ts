import Phaser from 'phaser'

import { MOVEMENT_RECORD_INTERVAL_MS } from '../data/matchConfig'
import type { GhostPlayer, MultiplayerEvent } from '../entities/GhostPlayer'
import { GhostPlayer as GhostPlayerClass } from '../entities/GhostPlayer'
import {
  commitMultiplayerEvent,
  initAsyncMultiplayer,
  pushMultiplayerSession,
  subscribeAsyncOpponentEvents,
} from '@/services/asyncMultiplayer'

/** Асинхронные сессии без визуальных призраков — на поле уже 10 ботов Pink */
export class AsyncMultiplayerSystem {
  readonly ghosts: GhostPlayerClass[] = []
  private lastMoveCommit = 0
  private lastX = 0
  private lastY = 0
  private unsubscribers: Array<() => void> = []

  constructor(private readonly scene: Phaser.Scene) {}

  async init(playerRating: number, playerLevel: number): Promise<void> {
    await initAsyncMultiplayer(playerRating, playerLevel)

    await subscribeAsyncOpponentEvents(
      (event) =>
        this.handleTransaction(
          event as { opponentId?: string; payload?: MultiplayerEvent },
        ),
      () => undefined,
    )
  }

  recordMove(time: number, x: number, y: number, vx: number, vy: number): void {
    if (time - this.lastMoveCommit < MOVEMENT_RECORD_INTERVAL_MS) return

    const moved = Math.hypot(x - this.lastX, y - this.lastY) > 8
    if (!moved && (vx !== 0 || vy !== 0)) return

    this.lastMoveCommit = time
    this.lastX = x
    this.lastY = y

    void commitMultiplayerEvent({ type: 'move', x, y, vx, vy })
  }

  recordEvent(event: MultiplayerEvent): void {
    void commitMultiplayerEvent(event)
  }

  async pushResult(score: number, playerLevel: number, teamScore: number): Promise<void> {
    await pushMultiplayerSession(score, playerLevel, teamScore)
  }

  update(_deltaSec: number): void {
    // призраки не отображаются — состав Pink заполнен ботами
  }

  destroy(): void {
    for (const unsub of this.unsubscribers) unsub()
    this.unsubscribers = []
    for (const ghost of this.ghosts) {
      ghost.sprite.destroy()
    }
    this.ghosts.length = 0
  }

  private handleTransaction(_event: {
    opponentId?: string
    payload?: MultiplayerEvent
  }): void {
    // события оппонентов пока не визуализируются
  }
}
