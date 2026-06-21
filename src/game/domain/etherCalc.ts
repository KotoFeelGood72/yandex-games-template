export interface RunRewardInput {
  kills: number
  gold: number
  timeSeconds: number
  bossesKilled: number
  waveIndex: number
}

export function calcEtherReward(input: RunRewardInput): number {
  const fromKills = input.kills * 2
  const fromGold = Math.floor(input.gold * 0.5)
  const fromTime = Math.floor(input.timeSeconds / 8)
  const fromBosses = input.bossesKilled * 40
  const fromWaves = Math.floor(input.waveIndex * 3)

  return Math.max(5, fromKills + fromGold + fromTime + fromBosses + fromWaves)
}
