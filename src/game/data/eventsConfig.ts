export type GameEventType = 'altar' | 'merchant' | 'cursed_chest' | 'rift' | 'anomaly'

export interface GameEventDefinition {
  id: GameEventType
  title: string
  description: string
  weight: number
}

export const GAME_EVENTS: GameEventDefinition[] = [
  { id: 'altar', title: 'Алтарь', description: 'Отдать HP — получить сильный бонус', weight: 2 },
  { id: 'merchant', title: 'Торговец', description: 'Купить артефакт за золото', weight: 2 },
  { id: 'cursed_chest', title: 'Проклятый сундук', description: 'Риск и высокая награда', weight: 1 },
  { id: 'rift', title: 'Разлом', description: 'Мини-испытание', weight: 1 },
  { id: 'anomaly', title: 'Аномалия', description: 'Временно меняет правила', weight: 1 },
]

export const EVENT_INTERVAL_MS = 150_000
