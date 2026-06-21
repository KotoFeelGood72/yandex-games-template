import {
  FACING_DIRS,
  WALK_FRAME_INDICES,
  WALK_FRAME_MS,
  WALK_FRAME_SEQUENCE,
  getPrimaryDirection,
  type FacingDir,
  type WalkFrameIndex,
} from './playerSpritesConfig'

export const CATCHER_SPRITE_PREFIX = 'lovec'
export const CATCHER_SPRITE_HEIGHT = 72
export const CATCHER_HIT_RADIUS = 24

export function getCatcherSpriteKey(dir: FacingDir, frame: WalkFrameIndex): string {
  return `${CATCHER_SPRITE_PREFIX}-${dir}-${frame}`
}

export function getCatcherIdleSpriteKey(dir: FacingDir = 'down'): string {
  return getCatcherSpriteKey(dir, 0)
}

export {
  FACING_DIRS,
  WALK_FRAME_INDICES,
  WALK_FRAME_MS,
  WALK_FRAME_SEQUENCE,
  getPrimaryDirection,
  type FacingDir,
  type WalkFrameIndex,
}
