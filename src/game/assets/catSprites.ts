import { MAX_LEVEL } from '@/game/config/objectLevels'

/** Файлы в assets/cats: 11.png … 40.png ↔ игровые уровни 1 … 30 */
export const CAT_SPRITE_INDEX_OFFSET = 10
export const CAT_SPRITE_FIRST = 11
export const CAT_SPRITE_LAST = 40

const sprites = new Map<number, HTMLImageElement>()
let circleFrame: HTMLImageElement | null = null
let gameFieldBackground: HTMLImageElement | null = null
let loadPromise: Promise<void> | null = null

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
}

export function getCatSpriteAssetId(level: number): number {
  return level + CAT_SPRITE_INDEX_OFFSET
}

export function getCatSpriteUrl(level: number): string {
  const assetId = getCatSpriteAssetId(level)
  return new URL(`../../assets/cats/${assetId}.png`, import.meta.url).href
}

export function preloadCatSprites(): Promise<void> {
  if (loadPromise) return loadPromise

  const circleUrl = new URL('../../assets/circle.png', import.meta.url).href
  const fieldBgUrl = new URL('../../assets/gamebg.png', import.meta.url).href

  loadPromise = Promise.all([
    loadImage(circleUrl).then((img) => {
      circleFrame = img
    }),
    loadImage(fieldBgUrl).then((img) => {
      gameFieldBackground = img
    }),
    ...Array.from({ length: MAX_LEVEL }, async (_, index) => {
      const level = index + 1
      const assetId = getCatSpriteAssetId(level)
      const url = new URL(`../../assets/cats/${assetId}.png`, import.meta.url).href
      const img = await loadImage(url)
      if (img) sprites.set(level, img)
    }),
  ]).then(() => undefined)

  return loadPromise
}

export function getCatSprite(level: number): HTMLImageElement | undefined {
  return sprites.get(level)
}

export function getCircleFrame(): HTMLImageElement | null {
  return circleFrame
}

export function getGameFieldBackground(): HTMLImageElement | null {
  return gameFieldBackground
}
