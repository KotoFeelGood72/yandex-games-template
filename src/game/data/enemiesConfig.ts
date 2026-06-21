export interface EnemyTypeConfig {
  id: string
  name: string
  hp: number
  speed: number
  damage: number
  xp: number
  color: number
  radius: number
  weight: number
}

export const ENEMY_TYPES: Record<string, EnemyTypeConfig> = {
  crawler: {
    id: 'crawler',
    name: 'Crawler',
    hp: 28,
    speed: 70,
    damage: 8,
    xp: 1,
    color: 0xff4444,
    radius: 12,
    weight: 3,
  },
  tank: {
    id: 'tank',
    name: 'Tank',
    hp: 95,
    speed: 35,
    damage: 15,
    xp: 4,
    color: 0xaa2222,
    radius: 18,
    weight: 10,
  },
  runner: {
    id: 'runner',
    name: 'Runner',
    hp: 20,
    speed: 115,
    damage: 6,
    xp: 2,
    color: 0xff8844,
    radius: 10,
    weight: 2,
  },
  shooter: {
    id: 'shooter',
    name: 'Shooter',
    hp: 42,
    speed: 45,
    damage: 10,
    xp: 3,
    color: 0xcc44ff,
    radius: 14,
    weight: 5,
  },
  splitter: {
    id: 'splitter',
    name: 'Splitter',
    hp: 58,
    speed: 55,
    damage: 10,
    xp: 3,
    color: 0x44ff88,
    radius: 14,
    weight: 6,
  },
  splitter_mini: {
    id: 'splitter_mini',
    name: 'Splitter Mini',
    hp: 18,
    speed: 85,
    damage: 5,
    xp: 1,
    color: 0x88ffbb,
    radius: 8,
    weight: 2,
  },
}

export function scaleEnemyStats(
  base: EnemyTypeConfig,
  waveIndex: number,
): { hp: number; damage: number; speed: number } {
  return {
    hp: base.hp * (1 + waveIndex * 0.12),
    damage: base.damage * (1 + waveIndex * 0.08),
    speed: base.speed * (1 + waveIndex * 0.02),
  }
}
