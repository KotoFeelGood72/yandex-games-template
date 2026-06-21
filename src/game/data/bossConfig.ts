export interface BossConfig {
  hp: number
  speed: number
  damage: number
  attackCooldown: number
  xpReward: number
  radius: number
  color: number
  dashSpeed: number
  dashDurationMs: number
  volleyCount: number
  projectileSpeed: number
}

export const BOSS_CONFIG: BossConfig = {
  hp: 1200,
  speed: 35,
  damage: 25,
  attackCooldown: 3,
  xpReward: 50,
  radius: 36,
  color: 0xff2266,
  dashSpeed: 180,
  dashDurationMs: 450,
  volleyCount: 8,
  projectileSpeed: 220,
}

export function scaleBossHp(baseHp: number, waveIndex: number): number {
  const bossNumber = waveIndex / 5
  return Math.floor(baseHp * (1 + (bossNumber - 1) * 0.45))
}
