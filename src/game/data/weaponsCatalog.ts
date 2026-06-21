export type WeaponSlot = 'primary' | 'secondary' | 'ultimate'

export interface WeaponCatalogEntry {
  id: string
  name: string
  slot: WeaponSlot
  description: string
  unlockedByDefault: boolean
}

export const WEAPONS_CATALOG: WeaponCatalogEntry[] = [
  { id: 'energy_bolt', name: 'Энергетический болт', slot: 'primary', description: 'Быстрая автоатака', unlockedByDefault: true },
  { id: 'void_spear', name: 'Копьё пустоты', slot: 'primary', description: 'Пробивает врагов', unlockedByDefault: false },
  { id: 'shotgun', name: 'Дробовик', slot: 'primary', description: 'Урон вплотную', unlockedByDefault: false },
  { id: 'railgun', name: 'Рельсотрон', slot: 'primary', description: 'Мощные редкие выстрелы', unlockedByDefault: false },
  { id: 'plasma_disc', name: 'Плазменный диск', slot: 'primary', description: 'Возвращается к герою', unlockedByDefault: false },
  { id: 'turret', name: 'Турель', slot: 'secondary', description: 'Автоматически стреляет', unlockedByDefault: false },
  { id: 'orbit_blades', name: 'Орбитальные клинки', slot: 'secondary', description: 'Вращаются вокруг героя', unlockedByDefault: false },
  { id: 'drone', name: 'Дрон', slot: 'secondary', description: 'Следует за игроком', unlockedByDefault: false },
  { id: 'mines', name: 'Мины', slot: 'secondary', description: 'Ставятся автоматически', unlockedByDefault: false },
  { id: 'totems', name: 'Энергетические тотемы', slot: 'secondary', description: 'Полезные зоны', unlockedByDefault: false },
]
