export interface HeroDefinition {
  id: string
  name: string
  description: string
  unlockCost: number
  speedMultiplier: number
  xpPickupMultiplier: number
  hpBonus: number
  armorBonus: number
  passiveId: string
}

export const HEROES: Record<string, HeroDefinition> = {
  wanderer: {
    id: 'wanderer',
    name: 'Странник',
    description: '+15% скорость, +10% сбор XP. Без урона 5 сек — ускорение.',
    unlockCost: 0,
    speedMultiplier: 1.15,
    xpPickupMultiplier: 1.1,
    hpBonus: 0,
    armorBonus: 0,
    passiveId: 'wanderer_momentum',
  },
  guardian: {
    id: 'guardian',
    name: 'Страж',
    description: '+30 HP, +15% броня. Периодический барьер.',
    unlockCost: 500,
    speedMultiplier: 1,
    xpPickupMultiplier: 1,
    hpBonus: 30,
    armorBonus: 0.15,
    passiveId: 'guardian_barrier',
  },
  engineer: {
    id: 'engineer',
    name: 'Инженер',
    description: 'Стартовая турель. Усиление устройств.',
    unlockCost: 800,
    speedMultiplier: 1,
    xpPickupMultiplier: 1,
    hpBonus: 0,
    armorBonus: 0,
    passiveId: 'engineer_turret',
  },
  alchemist: {
    id: 'alchemist',
    name: 'Алхимик',
    description: '+25% урон ядом. Яд распространяется.',
    unlockCost: 1000,
    speedMultiplier: 1,
    xpPickupMultiplier: 1,
    hpBonus: 0,
    armorBonus: 0,
    passiveId: 'alchemist_poison',
  },
  necromancer: {
    id: 'necromancer',
    name: 'Некромант',
    description: 'Стартовый миньон. Враги могут воскресать.',
    unlockCost: 1200,
    speedMultiplier: 1,
    xpPickupMultiplier: 1,
    hpBonus: 0,
    armorBonus: 0,
    passiveId: 'necromancer_raise',
  },
}

export const DEFAULT_HERO_ID = 'wanderer'

export function getHero(id: string): HeroDefinition {
  return HEROES[id] ?? HEROES.wanderer!
}
