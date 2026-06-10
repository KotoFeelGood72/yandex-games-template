import { balanceConfig } from '@/game/config/balanceConfig'

export type CatRarity =
  | 'common'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'divine'

export interface CatCatalogEntry {
  level: number
  name: string
  rarity: CatRarity
  emoji: string
  color: string
  description: string
  radius: number
  score: number
}

/** Базовый размер шара; радиусы из balanceConfig для большего места на поле */
export const MIN_OBJECT_RADIUS = balanceConfig.minObjectRadius
export const MAX_OBJECT_RADIUS = balanceConfig.maxObjectRadius
const TOTAL_CATALOG_LEVELS = 30

function catalogRadius(level: number): number {
  const clamped = Math.max(1, Math.min(level, TOTAL_CATALOG_LEVELS))
  if (TOTAL_CATALOG_LEVELS <= 1) return MIN_OBJECT_RADIUS
  const progress = (clamped - 1) / (TOTAL_CATALOG_LEVELS - 1)
  return Math.round(MIN_OBJECT_RADIUS + progress * (MAX_OBJECT_RADIUS - MIN_OBJECT_RADIUS))
}

/** 30 уровней — спрайты 11.png … 40.png (уровень + 10) */
export const catCatalog: CatCatalogEntry[] = [
  {
    level: 1,
    name: 'Снежный котёнок',
    rarity: 'common',
    emoji: '🐱',
    color: '#f5f5f5',
    description: 'Белый пушистик с голубыми глазами.',
    radius: catalogRadius(1),
    score: 2,
  },
  {
    level: 2,
    name: 'Британец серый',
    rarity: 'common',
    emoji: '🐱',
    color: '#b0b0b0',
    description: 'Круглый мордочкой и янтарными глазами.',
    radius: catalogRadius(2),
    score: 4,
  },
  {
    level: 3,
    name: 'Рыжий котёнок',
    rarity: 'common',
    emoji: '🐈',
    color: '#ffb86b',
    description: 'Рыжий табби, всегда в хорошем настроении.',
    radius: catalogRadius(3),
    score: 8,
  },
  {
    level: 4,
    name: 'Чёрный пушистик',
    rarity: 'common',
    emoji: '🐈‍⬛',
    color: '#333333',
    description: 'Пушистый чёрный кот с золотыми глазами.',
    radius: catalogRadius(4),
    score: 16,
  },
  {
    level: 5,
    name: 'Сиамский котёнок',
    rarity: 'common',
    emoji: '🐱',
    color: '#e8d4b8',
    description: 'Кремовый окрас и ярко-голубые глаза.',
    radius: catalogRadius(5),
    score: 32,
  },
  {
    level: 6,
    name: 'Полосатый пушистик',
    rarity: 'common',
    emoji: '🐱',
    color: '#c8a878',
    description: 'Длинная шерсть и полоски на лбу.',
    radius: catalogRadius(6),
    score: 64,
  },
  {
    level: 7,
    name: 'Серебряный табби',
    rarity: 'rare',
    emoji: '🐱',
    color: '#c0c0c0',
    description: 'Серебристый окрас и зелёные глаза.',
    radius: catalogRadius(7),
    score: 128,
  },
  {
    level: 8,
    name: 'Кремовый котик',
    rarity: 'rare',
    emoji: '🐱',
    color: '#fff0c8',
    description: 'Нежный кремовый пушистик с голубыми глазами.',
    radius: catalogRadius(8),
    score: 256,
  },
  {
    level: 9,
    name: 'Серо-белый кот',
    rarity: 'rare',
    emoji: '🐱',
    color: '#d8d8d8',
    description: 'Дымчатый окрас и белая грудка.',
    radius: catalogRadius(9),
    score: 512,
  },
  {
    level: 10,
    name: 'Трёхцветный кот',
    rarity: 'rare',
    emoji: '🐱',
    color: '#ffb8d8',
    description: 'Калико: белый, рыжий и чёрный.',
    radius: catalogRadius(10),
    score: 1024,
  },
  {
    level: 11,
    name: 'Шотландский вислоухий',
    rarity: 'rare',
    emoji: '🐱',
    color: '#a8a8a8',
    description: 'Сложенные ушки и удивлённый взгляд.',
    radius: catalogRadius(11),
    score: 2048,
  },
  {
    level: 12,
    name: 'Рэгдолл',
    rarity: 'rare',
    emoji: '🐱',
    color: '#e8d0b8',
    description: 'Пушистый рэгдолл с голубыми глазами.',
    radius: catalogRadius(12),
    score: 4096,
  },
  {
    level: 13,
    name: 'Бенгальский кот',
    rarity: 'rare',
    emoji: '🐆',
    color: '#e8a040',
    description: 'Пятнистый окрас и зелёные глаза.',
    radius: catalogRadius(13),
    score: 8192,
  },
  {
    level: 14,
    name: 'Белый ангорец',
    rarity: 'epic',
    emoji: '🤍',
    color: '#ffffff',
    description: 'Длинная белая шерсть и изумрудные глаза.',
    radius: catalogRadius(14),
    score: 16384,
  },
  {
    level: 15,
    name: 'Персидский серый',
    rarity: 'epic',
    emoji: '🦁',
    color: '#a0a0a0',
    description: 'Пушистый перс с густой шерстью.',
    radius: catalogRadius(15),
    score: 32768,
  },
  {
    level: 16,
    name: 'Шоколадный британец',
    rarity: 'epic',
    emoji: '🐱',
    color: '#6b4423',
    description: 'Шоколадный окрас и золотые глаза.',
    radius: catalogRadius(16),
    score: 65536,
  },
  {
    level: 17,
    name: 'Снежный табби',
    rarity: 'epic',
    emoji: '🐱',
    color: '#e8e8f0',
    description: 'Белый табби с серебристыми полосками.',
    radius: catalogRadius(17),
    score: 131072,
  },
  {
    level: 18,
    name: 'Кремовый табби',
    rarity: 'epic',
    emoji: '🐱',
    color: '#f0e0c8',
    description: 'Кремовый окрас и голубые глаза.',
    radius: catalogRadius(18),
    score: 262144,
  },
  {
    level: 19,
    name: 'Кот в смокинге',
    rarity: 'epic',
    emoji: '🐈‍⬛',
    color: '#2a2a2a',
    description: 'Чёрно-белый окрас, как настоящий джентльмен.',
    radius: catalogRadius(19),
    score: 524288,
  },
  {
    level: 20,
    name: 'Рыжий задорный',
    rarity: 'legendary',
    emoji: '🐈',
    color: '#ff9840',
    description: 'Рыжий кот, который подмигивает.',
    radius: catalogRadius(20),
    score: 1048576,
  },
  {
    level: 21,
    name: 'Черепаховый кот',
    rarity: 'legendary',
    emoji: '🐱',
    color: '#c87840',
    description: 'Пятнистый черепаховый окрас.',
    radius: catalogRadius(21),
    score: 2097152,
  },
  {
    level: 22,
    name: 'Кот с разными глазами',
    rarity: 'legendary',
    emoji: '👁️',
    color: '#f0f0f0',
    description: 'Один глаз голубой, другой — янтарный.',
    radius: catalogRadius(22),
    score: 4194304,
  },
  {
    level: 23,
    name: 'Пушистый табби',
    rarity: 'legendary',
    emoji: '🐱',
    color: '#b8b8c0',
    description: 'Длинношёрстный серо-белый табби.',
    radius: catalogRadius(23),
    score: 8388608,
  },
  {
    level: 24,
    name: 'Сфинкс',
    rarity: 'mythic',
    emoji: '🐱',
    color: '#f0c8b8',
    description: 'Без шерсти, но с большими ушами.',
    radius: catalogRadius(24),
    score: 16777216,
  },
  {
    level: 25,
    name: 'Мейн-кун',
    rarity: 'mythic',
    emoji: '🐈',
    color: '#909098',
    description: 'Крупный лесной кот с кисточками на ушах.',
    radius: catalogRadius(25),
    score: 33554432,
  },
  {
    level: 26,
    name: 'Лесной кот',
    rarity: 'mythic',
    emoji: '🐱',
    color: '#a0a8a0',
    description: 'Серый табби с радостным мурчанием.',
    radius: catalogRadius(26),
    score: 67108864,
  },
  {
    level: 27,
    name: 'Персидский кот',
    rarity: 'mythic',
    emoji: '🦁',
    color: '#c0c0c8',
    description: 'Пушистый аристократ с голубыми глазами.',
    radius: catalogRadius(27),
    score: 134217728,
  },
  {
    level: 28,
    name: 'Рыжий перс',
    rarity: 'divine',
    emoji: '🐈',
    color: '#ff9040',
    description: 'Длинношёрстный рыжий красавец.',
    radius: catalogRadius(28),
    score: 268435456,
  },
  {
    level: 29,
    name: 'Нежный рэгдолл',
    rarity: 'divine',
    emoji: '🐱',
    color: '#e8d8c8',
    description: 'Счастливый рэгдолл с голубыми глазами.',
    radius: catalogRadius(29),
    score: 536870912,
  },
  {
    level: 30,
    name: 'Великий кот удачи',
    rarity: 'divine',
    emoji: '⭐',
    color: '#c0c8c0',
    description: 'Финал коллекции — серо-белый табби.',
    radius: catalogRadius(30),
    score: 1073741824,
  },
]

export const MAX_CATALOG_LEVEL = catCatalog.length

export const rarityLabels: Record<CatRarity, string> = {
  common: 'Обычный',
  rare: 'Редкий',
  epic: 'Эпический',
  legendary: 'Легендарный',
  mythic: 'Мифический',
  divine: 'Божественный',
}

export function getCatByLevel(level: number): CatCatalogEntry {
  return catCatalog[level - 1]!
}
