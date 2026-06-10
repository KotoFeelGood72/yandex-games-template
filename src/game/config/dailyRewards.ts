import type { BoosterType } from '@/game/types/booster.types'

export interface DailyRewardDay {
  day: number
  label: string
  coins?: number
  booster?: { type: BoosterType; amount: number }
}

/** GDD §18 — 7-дневный цикл */
export const dailyRewardCycle: DailyRewardDay[] = [
  { day: 1, label: '100 монет', coins: 100 },
  { day: 2, label: 'Кото-бомба', booster: { type: 'bomb', amount: 1 } },
  { day: 3, label: '200 монет', coins: 200 },
  { day: 4, label: 'Радужный клубок', booster: { type: 'rainbow', amount: 1 } },
  { day: 5, label: '300 монет', coins: 300 },
  { day: 6, label: 'Печенька', booster: { type: 'cookie', amount: 1 } },
  { day: 7, label: 'Сундук', coins: 500, booster: { type: 'bomb', amount: 1 } },
]
