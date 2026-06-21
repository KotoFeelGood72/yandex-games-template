export type ArtifactRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'

export interface ArtifactDefinition {
  id: string
  name: string
  rarity: ArtifactRarity
  description: string
  damageBonus?: number
  hpBonus?: number
  speedBonus?: number
}

export const ARTIFACTS: ArtifactDefinition[] = [
  { id: 'void_shard', name: 'Осколок пустоты', rarity: 'common', description: '+5% урона', damageBonus: 0.05 },
  { id: 'pulse_core', name: 'Пульс-ядро', rarity: 'common', description: '+10 HP', hpBonus: 10 },
  { id: 'swift_coil', name: 'Катушка скорости', rarity: 'rare', description: '+8% скорости', speedBonus: 0.08 },
  { id: 'crit_lens', name: 'Линза крита', rarity: 'rare', description: '+5% крита', damageBonus: 0.05 },
  { id: 'plasma_heart', name: 'Плазменное сердце', rarity: 'epic', description: '+12% урона', damageBonus: 0.12 },
  { id: 'harvest_crown', name: 'Корона жатвы', rarity: 'legendary', description: '+20 HP, +10% урона', hpBonus: 20, damageBonus: 0.1 },
  { id: 'omega_fragment', name: 'Фрагмент Омеги', rarity: 'mythic', description: '+15% урона, +15% скорости', damageBonus: 0.15, speedBonus: 0.15 },
]

export function pickRandomArtifact(ids: string[]): ArtifactDefinition | null {
  const pool = ARTIFACTS.filter((a) => !ids.includes(a.id))
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)] ?? null
}
