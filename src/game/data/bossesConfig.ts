export type BossAttackPattern = 'core' | 'devourer' | 'hive' | 'archon' | 'destroyer' | 'omega'

export interface BossDefinition {
  id: string
  name: string
  hp: number
  speed: number
  damage: number
  xpReward: number
  radius: number
  color: number
  hpScalePerTier: number
  pattern: BossAttackPattern
}

export const BOSSES: Record<string, BossDefinition> = {
  mini_core: {
    id: 'mini_core',
    name: 'Ядро-Страж',
    hp: 600,
    speed: 40,
    damage: 18,
    xpReward: 25,
    radius: 28,
    color: 0xff8844,
    hpScalePerTier: 0.35,
    pattern: 'core',
  },
  devourer: {
    id: 'devourer',
    name: 'Пожиратель',
    hp: 1200,
    speed: 35,
    damage: 25,
    xpReward: 50,
    radius: 36,
    color: 0xff2266,
    hpScalePerTier: 0.45,
    pattern: 'devourer',
  },
  hive_queen: {
    id: 'hive_queen',
    name: 'Королева Роя',
    hp: 1400,
    speed: 32,
    damage: 22,
    xpReward: 55,
    radius: 38,
    color: 0xaa44ff,
    hpScalePerTier: 0.5,
    pattern: 'hive',
  },
  void_archon: {
    id: 'void_archon',
    name: 'Архонт Пустоты',
    hp: 1600,
    speed: 38,
    damage: 28,
    xpReward: 60,
    radius: 34,
    color: 0x44aaff,
    hpScalePerTier: 0.5,
    pattern: 'archon',
  },
  destroyer: {
    id: 'destroyer',
    name: 'Разрушитель',
    hp: 1800,
    speed: 30,
    damage: 32,
    xpReward: 65,
    radius: 40,
    color: 0xff6622,
    hpScalePerTier: 0.55,
    pattern: 'destroyer',
  },
  omega_core: {
    id: 'omega_core',
    name: 'Омега Ядро',
    hp: 2500,
    speed: 28,
    damage: 35,
    xpReward: 100,
    radius: 44,
    color: 0xff0044,
    hpScalePerTier: 0.6,
    pattern: 'omega',
  },
}

export function getBoss(id: string): BossDefinition {
  return BOSSES[id] ?? BOSSES.devourer!
}
