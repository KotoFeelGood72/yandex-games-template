import type { MergeObject } from '@/game/types/physics.types'

export function findNearestSameLevelObject(
  target: MergeObject,
  objects: MergeObject[],
): MergeObject | null {
  let nearest: MergeObject | null = null
  let minDist = Infinity

  for (const obj of objects) {
    if (obj.id === target.id) continue
    if (obj.level !== target.level) continue
    if (obj.isMerging) continue

    const dx = obj.body.position.x - target.body.position.x
    const dy = obj.body.position.y - target.body.position.y
    const dist = dx * dx + dy * dy

    if (dist < minDist) {
      minDist = dist
      nearest = obj
    }
  }

  return nearest
}

export function findObjectAtPoint(
  objects: MergeObject[],
  x: number,
  y: number,
): MergeObject | null {
  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i]!
    const dx = x - obj.body.position.x
    const dy = y - obj.body.position.y
    if (dx * dx + dy * dy <= obj.radius * obj.radius) {
      return obj
    }
  }
  return null
}

export function getTopObjects(objects: MergeObject[], count: number): MergeObject[] {
  return [...objects]
    .sort((a, b) => a.body.position.y - b.body.position.y)
    .slice(0, count)
}
