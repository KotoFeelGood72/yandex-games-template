import Matter from 'matter-js'

import { physicsConfig } from '@/game/config/physicsConfig'
import { getLevelDef } from '@/game/config/objectLevels'
import type { MergeObject } from '@/game/types/physics.types'

let objectIdCounter = 0

export function resetObjectIdCounter(): void {
  objectIdCounter = 0
}

export function createMergeObject(level: number, x: number, y: number): MergeObject {
  const def = getLevelDef(level)
  const body = Matter.Bodies.circle(x, y, def.radius, {
    restitution: physicsConfig.objectRestitution,
    friction: physicsConfig.objectFriction,
    frictionAir: physicsConfig.objectFrictionAir,
    density: physicsConfig.objectDensity,
    sleepThreshold: Infinity,
    label: `merge-object-${level}`,
  })

  return {
    id: `obj-${++objectIdCounter}`,
    level,
    body,
    radius: def.radius,
    scoreValue: def.score,
    isMerging: false,
    createdAt: Date.now(),
  }
}
