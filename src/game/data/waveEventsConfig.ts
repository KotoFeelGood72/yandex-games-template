import { getBoss } from './bossesConfig'

export type WaveEventType = 'normal' | 'mini_boss' | 'fog' | 'elite' | 'sector_boss'

export interface WaveEventConfig {
  type: WaveEventType
  label: string
  bossId?: string
  eliteMultiplier?: number
}

const SECTOR_BOSSES = ['devourer', 'hive_queen', 'void_archon', 'destroyer', 'omega_core'] as const

function getSectorBossId(waveIndex: number): string {
  const tier = Math.max(0, Math.floor(waveIndex / 15) - 1)
  return SECTOR_BOSSES[tier % SECTOR_BOSSES.length] ?? 'devourer'
}

export function getWaveEvent(waveIndex: number): WaveEventConfig {
  if (waveIndex === 5) {
    return { type: 'mini_boss', label: 'Мини-босс', bossId: 'mini_core' }
  }
  if (waveIndex === 7) {
    return { type: 'fog', label: 'Туман' }
  }
  if (waveIndex === 10) {
    return { type: 'elite', label: 'Элитные враги', eliteMultiplier: 2 }
  }
  if (waveIndex >= 15 && waveIndex % 15 === 0) {
    const bossId = getSectorBossId(waveIndex)
    return { type: 'sector_boss', label: getBoss(bossId).name, bossId }
  }
  return { type: 'normal', label: 'Обычная волна' }
}

export function isBossWave(waveIndex: number): boolean {
  const event = getWaveEvent(waveIndex)
  return event.type === 'mini_boss' || event.type === 'sector_boss'
}
