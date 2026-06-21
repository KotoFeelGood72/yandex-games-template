import Phaser from 'phaser'

import { DEFAULT_MATCH_PLAYER } from '../data/playerConfig'
import type { TeamId } from '../data/mapConfig'
import { Player } from './Player'

/** Бот команды противника */
export class BotPlayer extends Player {
  slotIndex = 0
  targetX = 0
  targetY = 0
  retargetAt = 0
  targetStickId: string | null = null

  constructor(scene: Phaser.Scene, x: number, y: number, team: TeamId, slotIndex = 0) {
    super(scene, x, y, DEFAULT_MATCH_PLAYER, team, false)
    this.slotIndex = slotIndex
    this.sprite.setAlpha(0.85)
  }
}
