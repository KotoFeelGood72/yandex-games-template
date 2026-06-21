export const NEON_TEXTURE_PREFIX = 'neon'
export const NEON_TEXTURE_IDS = [1, 2, 3] as const

/** Вертикальные и диагональные неоны — по высоте */
export const NEON_DISPLAY_HEIGHT = 28

/** Горизонтальные неоны (3.png) — по ширине, короче на карте */
export const NEON_HORIZONTAL_DISPLAY_WIDTH = 36

export function getNeonTextureKey(id: number): string {
  return `${NEON_TEXTURE_PREFIX}-${id}`
}

export function pickRandomNeonVariant(): number {
  const index = Math.floor(Math.random() * NEON_TEXTURE_IDS.length)
  return NEON_TEXTURE_IDS[index]!
}

export function isHorizontalNeonVariant(id: number): boolean {
  return id === 3
}
