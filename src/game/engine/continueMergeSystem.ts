import { MAX_LEVEL } from '@/game/config/gameConfig'
import { getTopObjects } from '@/game/engine/boosterSystem'
import type { MergeObject } from '@/game/types/physics.types'

export function findMergeablePair(objects: MergeObject[]): [MergeObject, MergeObject] | null {
  let bestPair: [MergeObject, MergeObject] | null = null
  let bestAvgY = Infinity

  for (let i = 0; i < objects.length; i++) {
    const a = objects[i]!
    if (a.isMerging || a.level >= MAX_LEVEL) continue

    for (let j = i + 1; j < objects.length; j++) {
      const b = objects[j]!
      if (b.isMerging || b.level >= MAX_LEVEL) continue
      if (a.level !== b.level) continue

      const avgY = (a.body.position.y + b.body.position.y) / 2
      if (avgY < bestAvgY) {
        bestAvgY = avgY
        bestPair = [a, b]
      }
    }
  }

  return bestPair
}

export function reduceObjectsByMerging(
  getObjects: () => MergeObject[],
  targetCount: number,
  performMerge: (a: MergeObject, b: MergeObject) => void,
  removeObject: (obj: MergeObject) => void,
): void {
  const initialCount = getObjects().length
  if (initialCount <= targetCount) return

  const maxSteps = initialCount
  for (let step = 0; step < maxSteps; step++) {
    const objects = getObjects()
    if (objects.length <= targetCount) break

    const pair = findMergeablePair(objects)
    if (pair) {
      performMerge(pair[0], pair[1])
      continue
    }

    const top = getTopObjects(objects, 1)[0]
    if (!top) break
    removeObject(top)
  }
}
