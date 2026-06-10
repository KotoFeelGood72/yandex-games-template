import type { BoosterType } from '@/game/types/booster.types'

export interface CollectionMilestone {
  id: string
  unlockedCount: number
  title: string
  reward: {
    coins?: number
    booster?: { type: BoosterType; amount: number }
  }
}

/** GDD §16.1 */
export const collectionMilestones: CollectionMilestone[] = [
  {
    id: 'col_5',
    unlockedCount: 5,
    title: 'Начало коллекции',
    reward: { coins: 100 },
  },
  {
    id: 'col_10',
    unlockedCount: 10,
    title: 'Опытный коллекционер',
    reward: { booster: { type: 'rainbow', amount: 1 } },
  },
  {
    id: 'col_15',
    unlockedCount: 15,
    title: 'Мастер котиков',
    reward: { coins: 300, booster: { type: 'bomb', amount: 1 } },
  },
  {
    id: 'col_20',
    unlockedCount: 20,
    title: 'Легенда поля',
    reward: { coins: 500 },
  },
  {
    id: 'col_30',
    unlockedCount: 30,
    title: 'Полная коллекция',
    reward: { coins: 1000, booster: { type: 'rainbow', amount: 2 } },
  },
]
