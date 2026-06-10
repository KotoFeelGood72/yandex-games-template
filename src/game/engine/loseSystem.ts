import {
  LOSE_DELAY_MS,
  LOSE_LINE_Y,
  LOSE_STABLE_VELOCITY,
  OBJECT_MIN_AGE_MS,
} from '@/game/config/gameConfig'
import type { MergeObject } from '@/game/types/physics.types'

export interface LoseState {
  loseTimerStartedAt: number | null
}

export function checkLoseCondition(
  objects: MergeObject[],
  state: LoseState,
  now: number,
  protectionUntil = 0,
): { shouldLose: boolean; state: LoseState } {
  if (now < protectionUntil) {
    return { shouldLose: false, state: { loseTimerStartedAt: null } }
  }

  const dangerousObjects = objects.filter((object) => {
    const body = object.body
    const isAboveLine = body.position.y - object.radius < LOSE_LINE_Y
    const isStableEnough = Math.abs(body.velocity.y) < LOSE_STABLE_VELOCITY
    const isOldEnough = now - object.createdAt > OBJECT_MIN_AGE_MS
    return isAboveLine && isStableEnough && isOldEnough && !object.isMerging
  })

  if (dangerousObjects.length > 0) {
    if (!state.loseTimerStartedAt) {
      return { shouldLose: false, state: { loseTimerStartedAt: now } }
    }
    if (now - state.loseTimerStartedAt >= LOSE_DELAY_MS) {
      return { shouldLose: true, state }
    }
    return { shouldLose: false, state }
  }

  return { shouldLose: false, state: { loseTimerStartedAt: null } }
}

export function getLoseProgress(state: LoseState, now: number): number {
  if (!state.loseTimerStartedAt) return 0
  return Math.min(1, (now - state.loseTimerStartedAt) / LOSE_DELAY_MS)
}

/** Объект пересёк линию проигрыша сверху вниз (верх шара на уровне линии или ниже) */
export function hasPassedLoseLine(object: MergeObject): boolean {
  return object.body.position.y - object.radius >= LOSE_LINE_Y
}
