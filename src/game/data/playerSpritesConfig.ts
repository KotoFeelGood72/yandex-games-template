import type { TeamId } from './mapConfig'

export type FacingDir = 'up' | 'down' | 'left' | 'right'
export type WalkFrameIndex = 0 | 1 | 2

export const FACING_DIRS: readonly FacingDir[] = ['up', 'down', 'left', 'right']
export const WALK_FRAME_INDICES: readonly WalkFrameIndex[] = [0, 1, 2]

/** Цикл шага: idle → шаг 1 → idle → шаг 2 */
export const WALK_FRAME_SEQUENCE: readonly WalkFrameIndex[] = [0, 1, 0, 2]

export const WALK_FRAME_MS = 130
export const PLAYER_SPRITE_HEIGHT = 56

export function getTeamSpriteFolder(team: TeamId): string {
  return team === 'blue' ? 'yellow' : 'red'
}

export function getPlayerSpriteKey(
  team: TeamId,
  dir: FacingDir,
  frame: WalkFrameIndex,
): string {
  return `team-${getTeamSpriteFolder(team)}-${dir}-${frame}`
}

export function getPrimaryDirection(
  moveX: number,
  moveY: number,
): FacingDir | null {
  if (moveX === 0 && moveY === 0) return null

  if (Math.abs(moveY) >= Math.abs(moveX)) {
    return moveY < 0 ? 'up' : 'down'
  }

  return moveX < 0 ? 'left' : 'right'
}

export function getIdleSpriteKey(team: TeamId, dir: FacingDir): string {
  return getPlayerSpriteKey(team, dir, 0)
}
