import Matter from 'matter-js'

import {
  MAX_LEVEL,
  MERGE_BLAST_RADIUS,
  MERGE_BLAST_VELOCITY,
  MERGE_POP_VELOCITY,
  VICTORY_MILESTONES,
} from '@/game/config/gameConfig'
import { getCoinsForMerge, getLevelDef } from '@/game/config/objectLevels'
import type { MergeObject } from '@/game/types/physics.types'

export interface MergeCallbacks {
  onScore: (points: number, comboMultiplier: number) => void
  onCoins: (amount: number) => void
  onMergeEffect: (x: number, y: number, level: number) => void
  onLevelUnlocked: (level: number) => void
  onVictory: (level: number) => void
}

export function canMerge(a: MergeObject, b: MergeObject): boolean {
  if (a.level !== b.level) return false
  if (a.isMerging || b.isMerging) return false
  if (a.level >= MAX_LEVEL) return false
  return true
}

export function applyMergeBlast(
  centerX: number,
  centerY: number,
  objects: MergeObject[],
  excludeIds: ReadonlySet<string>,
): void {
  for (const obj of objects) {
    if (excludeIds.has(obj.id) || obj.isMerging) continue

    const dx = obj.body.position.x - centerX
    const dy = obj.body.position.y - centerY
    const dist = Math.hypot(dx, dy)
    const maxDist = MERGE_BLAST_RADIUS + obj.radius

    if (dist > maxDist || dist < 0.01) continue

    const falloff = 1 - dist / maxDist
    const strength = MERGE_BLAST_VELOCITY * falloff * falloff
    const nx = dx / dist
    const ny = dy / dist

    const { x: vx, y: vy } = obj.body.velocity
    Matter.Body.setVelocity(obj.body, {
      x: vx + nx * strength * 0.55,
      y: vy + ny * strength * 0.25 - strength * 0.95,
    })
  }
}

export interface MergeOptions {
  /** Без взрыва, без pop вверх, без очков/колбэков — для continue после рекламы */
  silent?: boolean
}

export function mergeObjects(
  objectA: MergeObject,
  objectB: MergeObject,
  allObjects: MergeObject[],
  spawnObject: (level: number, x: number, y: number) => MergeObject,
  removeObject: (obj: MergeObject) => void,
  callbacks: MergeCallbacks,
  comboMultiplier: number,
  options: MergeOptions = {},
): MergeObject | null {
  const silent = options.silent === true
  objectA.isMerging = true
  objectB.isMerging = true

  const newLevel = objectA.level + 1
  const newX = (objectA.body.position.x + objectB.body.position.x) / 2
  const newY = (objectA.body.position.y + objectB.body.position.y) / 2

  if (!silent) {
    applyMergeBlast(newX, newY, allObjects, new Set([objectA.id, objectB.id]))
  }

  removeObject(objectA)
  removeObject(objectB)

  const newObject = spawnObject(newLevel, newX, newY)

  Matter.Body.setVelocity(newObject.body, {
    x: silent ? 0 : (Math.random() - 0.5) * 1.2,
    y: silent ? 0 : -MERGE_POP_VELOCITY,
  })

  if (silent) {
    return newObject
  }

  const def = getLevelDef(newLevel)
  callbacks.onScore(def.score, comboMultiplier)
  callbacks.onCoins(getCoinsForMerge(newLevel))
  callbacks.onMergeEffect(newX, newY, newLevel)
  callbacks.onLevelUnlocked(newLevel)

  if (VICTORY_MILESTONES.includes(newLevel)) {
    callbacks.onVictory(newLevel)
  }

  return newObject
}
