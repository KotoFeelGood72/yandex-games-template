export type BoosterType = 'bomb' | 'rainbow' | 'cookie'

export interface ShopItem {
  id: BoosterType
  type: 'booster'
  title: string
  price: number
  description: string
}

/** GDD §19.2 */
export const shopItems: ShopItem[] = [
  {
    id: 'bomb',
    type: 'booster',
    title: 'Кото-бомба',
    price: 300,
    description: 'Удаляет выбранный объект с поля.',
  },
  {
    id: 'rainbow',
    type: 'booster',
    title: 'Радужный клубок',
    price: 500,
    description: 'Сливает с ближайшим объектом того же уровня.',
  },
  {
    id: 'cookie',
    type: 'booster',
    title: 'Кошачья печенька',
    price: 300,
    description: 'Уменьшает выбранный объект на 1 уровень.',
  },
]
