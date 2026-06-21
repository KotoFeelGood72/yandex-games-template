import Phaser from 'phaser'

import { getMapBounds } from '../data/mapConfig'
import { PLAYER_HIT_RADIUS } from '../entities/Player'
import type { Player } from '../entities/Player'

/** Минимальная дистанция между центрами игроков (2 × hitbox + зазор) */
export const PARTICIPANT_MIN_DISTANCE = PLAYER_HIT_RADIUS * 2 + 8

interface SeparableEntity {
  x: number
  y: number
  sprite: { x: number; y: number }
  body?: Phaser.Physics.Arcade.Body
}

/** Раздвигает объекты, чтобы не залипали друг в друге */
export function applySeparation(
  entities: SeparableEntity[],
  minDistance: number,
  strength = 0.5,
): void {
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const a = entities[i]!
      const b = entities[j]!
      let dx = b.x - a.x
      let dy = b.y - a.y
      let dist = Math.hypot(dx, dy)

      if (dist >= minDistance) continue

      if (dist < 0.001) {
        const angle = ((i + 1) * 2.399963 + j) % (Math.PI * 2)
        dx = Math.cos(angle)
        dy = Math.sin(angle)
        dist = 1
      }

      const overlap = (minDistance - dist) * strength
      const nx = dx / dist
      const ny = dy / dist

      a.sprite.x -= nx * overlap
      a.sprite.y -= ny * overlap
      b.sprite.x += nx * overlap
      b.sprite.y += ny * overlap
      syncBodyCenter(a)
      syncBodyCenter(b)
    }
  }
}

/** Один мягкий проход — без «отбрасывания» назад */
export function resolveParticipantOverlap(
  entities: SeparableEntity[],
  minDistance: number,
): void {
  applySeparation(entities, minDistance, 0.35)
}

export function clampParticipantsToMap(participants: Player[]): void {
  const bounds = getMapBounds()
  const r = PLAYER_HIT_RADIUS

  for (const participant of participants) {
    participant.sprite.x = Phaser.Math.Clamp(
      participant.sprite.x,
      bounds.left + r,
      bounds.right - r,
    )
    participant.sprite.y = Phaser.Math.Clamp(
      participant.sprite.y,
      bounds.top + r,
      bounds.bottom - r,
    )
    participant.syncBodyFromSprite()
  }
}

function syncBodyCenter(entity: SeparableEntity): void {
  if (!entity.body) return
  entity.body.center.set(entity.sprite.x, entity.sprite.y)
}
