export const DECORATOR_TEXTURE_PREFIX = 'decorator'

/** Фактически существующие файлы в public/decorator/ (23.png отсутствует) */
export const DECORATOR_TEXTURE_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 25,
] as const

/** Сколько декораций на карте 3000×3000 */
export const DECORATOR_SPAWN_COUNT = 95
export const DECORATOR_MAP_MARGIN = 140
export const DECORATOR_MIN_SPACING = 72
export const DECORATOR_DISPLAY_HEIGHT = 68
export const DECORATOR_DEPTH = 3

export function getDecoratorTextureKey(id: number): string {
  return `${DECORATOR_TEXTURE_PREFIX}-${id}`
}

export function pickRandomDecoratorId(): number {
  const index = Math.floor(Math.random() * DECORATOR_TEXTURE_IDS.length)
  return DECORATOR_TEXTURE_IDS[index]!
}
