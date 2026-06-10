import Matter from 'matter-js'

import { GAME_HEIGHT } from '@/game/config/gameConfig'
import type { MergeObject } from '@/game/types/physics.types'

const BOUNDS_PADDING = 2

export function zeroAllVelocities(objects: MergeObject[]): void {
  for (const obj of objects) {
    Matter.Sleeping.set(obj.body, false)
    Matter.Body.setVelocity(obj.body, { x: 0, y: 0 })
    Matter.Body.setAngularVelocity(obj.body, 0)
  }
}

export function resetObjectsAge(objects: MergeObject[], now = Date.now()): void {
  for (const obj of objects) {
    obj.createdAt = now
  }
}

/** Сдвигает всю кучу вниз к полу, сохраняя форму. */
export function alignFieldToFloor(objects: MergeObject[]): void {
  if (objects.length === 0) return

  const floorBottom = GAME_HEIGHT - BOUNDS_PADDING
  let lowestBottom = -Infinity

  for (const obj of objects) {
    lowestBottom = Math.max(lowestBottom, obj.body.position.y + obj.radius)
  }

  const shiftY = floorBottom - lowestBottom
  if (Math.abs(shiftY) < 0.5) return

  for (const obj of objects) {
    Matter.Body.setPosition(obj.body, {
      x: obj.body.position.x,
      y: obj.body.position.y + shiftY,
    })
  }
}

export function wakeAllObjects(objects: MergeObject[]): void {
  for (const obj of objects) {
    Matter.Sleeping.set(obj.body, false)
  }
}
