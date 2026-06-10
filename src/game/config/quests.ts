import type { BoosterType } from '@/game/types/booster.types'

export type QuestMetric =
  | 'play_games'
  | 'score_daily'
  | 'merge_count'
  | 'reach_level'
  | 'combo_max'
  | 'use_booster'
  | 'create_level_count'

export interface QuestReward {
  coins?: number
  booster?: { type: BoosterType; amount: number }
}

export interface QuestDef {
  id: string
  title: string
  description: string
  metric: QuestMetric
  target: number
  /** Для create_level_count — какой уровень считать */
  levelTarget?: number
  reward: QuestReward
}

/** GDD §17.1 */
export const dailyQuests: QuestDef[] = [
  {
    id: 'merge_20',
    title: 'Мастер слияний',
    description: 'Сделай 20 слияний за день',
    metric: 'merge_count',
    target: 20,
    reward: { coins: 80 },
  },
  {
    id: 'fish_3',
    title: 'Рыбный день',
    description: 'Создай 3 маленькие рыбки',
    metric: 'create_level_count',
    levelTarget: 6,
    target: 3,
    reward: { coins: 100 },
  },
  {
    id: 'combo_3',
    title: 'Комбо-мастер',
    description: 'Получи комбо x3 за день',
    metric: 'combo_max',
    target: 3,
    reward: { booster: { type: 'cookie', amount: 1 } },
  },
  {
    id: 'score_5000',
    title: 'Очковый рывок',
    description: 'Набери 5000 очков за день',
    metric: 'score_daily',
    target: 5000,
    reward: { coins: 150 },
  },
  {
    id: 'play_3',
    title: 'Игровой день',
    description: 'Сыграй 3 сессии',
    metric: 'play_games',
    target: 3,
    reward: { coins: 60 },
  },
  {
    id: 'booster_1',
    title: 'С секретом',
    description: 'Используй 1 бустер',
    metric: 'use_booster',
    target: 1,
    reward: { booster: { type: 'bomb', amount: 1 } },
  },
]
