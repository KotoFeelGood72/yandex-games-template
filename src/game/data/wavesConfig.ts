export interface WaveConfig {
  index: number
  duration: number
  enemyBudget: number
  spawnInterval: number
  enemyTypes: string[]
  boss: boolean
}

export const WAVE_DURATION = 60
import { isBossWave } from './waveEventsConfig'
export const MAX_ALIVE_ENEMIES = 180
export const SPAWN_OFFSET_MIN = 80
export const SPAWN_OFFSET_MAX = 160

export function createWaveConfig(index: number): WaveConfig {
  const enemyTypes: string[] = ['crawler']

  if (index >= 2) enemyTypes.push('runner')
  if (index >= 3) enemyTypes.push('tank')
  if (index >= 4) enemyTypes.push('shooter')
  if (index >= 5) enemyTypes.push('splitter')

  return {
    index,
    duration: WAVE_DURATION,
    enemyBudget: 320 + (index - 1) * 75,
    spawnInterval: Math.max(0.35, 0.75 - (index - 1) * 0.05),
    enemyTypes,
    boss: isBossWave(index),
  }
}
