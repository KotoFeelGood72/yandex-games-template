import { catCatalog, getCatByLevel, MAX_CATALOG_LEVEL } from '@/game/config/cats'

export interface ObjectLevelDef {
  level: number
  radius: number
  score: number
  color: string
  label: string
}

export function getObjectRadius(level: number): number {
  return getCatByLevel(level).radius
}

export const objectLevels: ObjectLevelDef[] = catCatalog.map((cat) => ({
  level: cat.level,
  radius: getObjectRadius(cat.level),
  score: cat.score,
  color: cat.color,
  label: cat.name,
}))

export const MAX_LEVEL = MAX_CATALOG_LEVEL

export function getLevelDef(level: number): ObjectLevelDef {
  const cat = getCatByLevel(level)
  return {
    level: cat.level,
    radius: getObjectRadius(level),
    score: cat.score,
    color: cat.color,
    label: cat.name,
  }
}

/** GDD §22.1 */
export function getCoinsForMerge(level: number): number {
  return Math.max(1, Math.floor(level / 2))
}
