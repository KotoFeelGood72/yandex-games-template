import { balanceConfig } from '@/game/config/balanceConfig'
import { MAX_LEVEL } from '@/game/config/objectLevels'

export { MAX_LEVEL }

export const GAME_WIDTH = 390
export const GAME_HEIGHT = 720

export const LOSE_LINE_Y = balanceConfig.loseLineY
/** Высота зоны сброса: от верха поля до линии проигрыша */
export const DROP_ZONE_HEIGHT = LOSE_LINE_Y
/** Котик по центру зоны сброса */
export const DROP_Y = DROP_ZONE_HEIGHT / 2
export const DROP_INITIAL_VELOCITY = 9
export const PREVIEW_FOLLOW_LAMBDA = 16
export const PREVIEW_BOB_AMPLITUDE = 3
export const PREVIEW_BOB_SPEED = 4.2
export const PREVIEW_CLEARANCE = 28
export const NEXT_PREVIEW_DELAY_MS = 400
export const DROP_CLEAR_TIMEOUT_MS = 2500

export const LOSE_DELAY_MS = balanceConfig.loseDelayMs

export const COMBO_WINDOW_MS = balanceConfig.comboWindowMs
export const COMBO_MAX = balanceConfig.comboMax

export const CONTINUE_COST = 700
export const CONTINUE_REMOVE_COUNT = 5
/** Доля шариков, которая остаётся после continue (остальные сливаются автоматически) */
export const CONTINUE_MERGE_TARGET_RATIO = 0.5
export const CONTINUE_PROTECTION_MS = 8000
export const MAX_CONTINUE_PER_SESSION = 2

/** GDD §15 — вехи победы (локальные пики) */
export const VICTORY_MILESTONES = [12, 18, 22, 30]

export const MERGE_POP_VELOCITY = 5.5
export const MERGE_BLAST_RADIUS = 150
export const MERGE_BLAST_VELOCITY = 7

export const MAX_VELOCITY = 26
export const MAX_ANGULAR_VELOCITY = 0.18
export const OBJECT_MIN_AGE_MS = balanceConfig.objectMinAgeMs
export const LOSE_STABLE_VELOCITY = balanceConfig.loseStableVelocity
