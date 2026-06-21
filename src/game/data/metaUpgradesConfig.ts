export interface MetaUpgradeDefinition {
  id: string
  title: string
  description: string
  maxLevel: number
  bonusPerLevel: number
  baseCost: number
  costGrowth: number
}

export const META_UPGRADES: MetaUpgradeDefinition[] = [
  {
    id: 'damage',
    title: 'Урон',
    description: '+5% урона за уровень (макс. +50%)',
    maxLevel: 10,
    bonusPerLevel: 0.05,
    baseCost: 50,
    costGrowth: 1.35,
  },
  {
    id: 'health',
    title: 'Здоровье',
    description: '+5% HP за уровень (макс. +50%)',
    maxLevel: 10,
    bonusPerLevel: 0.05,
    baseCost: 50,
    costGrowth: 1.35,
  },
  {
    id: 'speed',
    title: 'Скорость',
    description: '+2.5% скорости за уровень (макс. +25%)',
    maxLevel: 10,
    bonusPerLevel: 0.025,
    baseCost: 40,
    costGrowth: 1.3,
  },
  {
    id: 'crit',
    title: 'Шанс крита',
    description: '+2% крита за уровень (макс. +20%)',
    maxLevel: 10,
    bonusPerLevel: 0.02,
    baseCost: 60,
    costGrowth: 1.4,
  },
  {
    id: 'xp_pickup',
    title: 'Сбор XP',
    description: '+4% радиуса XP за уровень (макс. +40%)',
    maxLevel: 10,
    bonusPerLevel: 0.04,
    baseCost: 45,
    costGrowth: 1.32,
  },
  {
    id: 'start_gold',
    title: 'Стартовое золото',
    description: '+10% золота за уровень (макс. +100%)',
    maxLevel: 10,
    bonusPerLevel: 0.1,
    baseCost: 35,
    costGrowth: 1.28,
  },
]

export function getMetaUpgradeCost(def: MetaUpgradeDefinition, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(def.costGrowth, currentLevel))
}

export function getMetaUpgradeLevel(
  levels: Record<string, number>,
  id: string,
): number {
  return levels[id] ?? 0
}
