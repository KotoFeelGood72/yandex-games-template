import Phaser from 'phaser'

import {
  EXCHANGE_DURATION_MS,
  NEON_PER_SUSHI,
  TRADER_INTERACT_RADIUS,
} from '../data/matchConfig'
import { canExchange } from '../domain/scoreCalc'
import type { Player } from '../entities/Player'
import type { Catcher } from '../entities/Catcher'

export class ExchangeSystem {
  private progressMs = 0
  private active = false

  update(
    time: number,
    deltaMs: number,
    player: Player,
    trader: Catcher | null,
    interactHeld: boolean,
    onComplete: () => void,
  ): void {
    if (!trader || !interactHeld) {
      this.cancel(player)
      return
    }

    const dist = Phaser.Math.Distance.Between(
      player.x,
      player.y,
      trader.x,
      trader.y,
    )

    if (dist > TRADER_INTERACT_RADIUS) {
      this.cancel(player)
      return
    }

    if (!canExchange(player.inventory, NEON_PER_SUSHI)) {
      this.cancel(player)
      return
    }

    if (!this.active) {
      this.active = true
      this.progressMs = 0
      player.startExchange(time, EXCHANGE_DURATION_MS)
    }

    this.progressMs += deltaMs

    if (this.progressMs >= EXCHANGE_DURATION_MS) {
      player.inventory.neon -= NEON_PER_SUSHI
      player.inventory.sushi += 1
      player.cancelExchange()
      this.active = false
      this.progressMs = 0
      onComplete()
    }
  }

  getProgress(): number {
    if (!this.active) return 0
    return Math.min(1, this.progressMs / EXCHANGE_DURATION_MS)
  }

  isActive(): boolean {
    return this.active
  }

  cancel(player: Player): void {
    if (this.active) {
      player.cancelExchange()
    }
    this.active = false
    this.progressMs = 0
  }
}
