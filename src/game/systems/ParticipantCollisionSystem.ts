import Phaser from 'phaser'

import type { Player } from '../entities/Player'
import { PLAYER_HIT_RADIUS } from '../entities/Player'

/** Коллайдеры между игроками — только группа для учёта, без arcade-collider (даёт тряску) */
export class ParticipantCollisionSystem {
  private readonly group: Phaser.Physics.Arcade.Group

  constructor(private readonly scene: Phaser.Scene) {
    this.group = scene.physics.add.group()
  }

  add(participant: Player): void {
    if (this.group.contains(participant.sprite)) return

    participant.body.setCircle(PLAYER_HIT_RADIUS)
    participant.body.setCollideWorldBounds(true)
    participant.body.setImmovable(false)

    this.group.add(participant.sprite)
  }

  setup(): void {
    // Раздвижение — через resolveParticipantOverlap, не через arcade collider
  }

  getAll(): Player[] {
    return this.group.getChildren().map((obj) => {
      const go = obj as Phaser.GameObjects.Image
      return go.getData('participant') as Player
    }).filter(Boolean)
  }
}
