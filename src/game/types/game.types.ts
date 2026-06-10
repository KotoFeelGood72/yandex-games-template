export type HubScreen = 'home' | 'shop' | 'collection' | 'tasks'

export type GameState =
  | 'menu'
  | 'shop'
  | 'collection'
  | 'tasks'
  | 'tutorial'
  | 'playing'
  | 'paused'
  | 'gameOver'
  | 'continueOffer'
  | 'victory'

export const HUB_STATES: HubScreen[] = ['home', 'shop', 'collection', 'tasks']

export function isHubState(state: GameState): boolean {
  return state === 'menu' || state === 'shop' || state === 'collection' || state === 'tasks'
}

export function hubScreenFromState(state: GameState): HubScreen {
  if (state === 'menu') return 'home'
  if (state === 'shop' || state === 'collection' || state === 'tasks') return state
  return 'home'
}

export type BoosterMode = null | 'bomb' | 'rainbow' | 'cookie'

export interface NextObject {
  level: number
  /** Сглаженная позиция для отрисовки */
  x: number
  /** Целевая позиция (палец / мышь) */
  targetX: number
  y: number
  /** Наклон при движении влево/вправо */
  tilt: number
  velocityX: number
}

export interface MergeEffect {
  id: number
  x: number
  y: number
  level: number
  createdAt: number
}

export interface ScorePopup {
  id: number
  x: number
  y: number
  text: string
  createdAt: number
}

export interface ComboCallout {
  text: string
  combo: number
  createdAt: number
}
