import type { PlayerConfig } from './survivorPlayerConfig'
import type { WeaponConfig } from './weaponsConfig'
import { calcXpToNextLevel } from './survivorPlayerConfig'

export interface UpgradeDefinition {
  id: string
  title: string
  description: string
  tags?: string[]
  secondaryUnlock?: string
  secondaryUpgrade?: string
  apply: (player: PlayerConfig, weapon: WeaponConfig) => void
}

export const UPGRADES: UpgradeDefinition[] = [
  {
    id: 'damage_up',
    title: 'Damage Up',
    description: '+15% урон',
    apply: (player) => {
      player.damageMultiplier *= 1.15
    },
  },
  {
    id: 'fire_rate_up',
    title: 'Fire Rate Up',
    description: '+12% скорость атаки',
    apply: (player) => {
      player.fireRateMultiplier *= 1.12
    },
  },
  {
    id: 'move_speed_up',
    title: 'Move Speed Up',
    description: '+10% скорость движения',
    apply: (player) => {
      player.speed *= 1.1
    },
  },
  {
    id: 'projectile_speed_up',
    title: 'Projectile Speed Up',
    description: '+15% скорость пуль',
    apply: (player) => {
      player.projectileSpeedMultiplier *= 1.15
    },
  },
  {
    id: 'max_hp_up',
    title: 'Max HP Up',
    description: '+20 максимального HP',
    apply: (player) => {
      player.maxHp += 20
      player.hp += 20
    },
  },
  {
    id: 'heal',
    title: 'Heal',
    description: 'Восстановить 30 HP',
    apply: (player) => {
      player.hp = Math.min(player.maxHp, player.hp + 30)
    },
  },
  {
    id: 'pierce_up',
    title: 'Pierce Up',
    description: 'Пули пробивают +1 врага',
    apply: (_player, weapon) => {
      weapon.pierce += 1
    },
  },
  {
    id: 'double_shot',
    title: 'Double Shot',
    description: '+1 дополнительный снаряд',
    apply: (_player, weapon) => {
      weapon.projectileCount += 1
    },
  },
  {
    id: 'magnet',
    title: 'Magnet',
    description: '+25% радиус сбора XP',
    tags: ['utility'],
    apply: (player) => {
      player.pickupRadius *= 1.25
    },
  },
  {
    id: 'ember_rounds',
    title: 'Угольные заряды',
    description: '+10% урона',
    tags: ['fire'],
    apply: (player) => {
      player.damageMultiplier *= 1.1
    },
  },
  {
    id: 'blast_core',
    title: 'Взрывное ядро',
    description: 'Снаряды получают взрывной потенциал',
    tags: ['explosion'],
    apply: (player) => {
      player.damageMultiplier *= 1.08
    },
  },
  {
    id: 'frost_edge',
    title: 'Ледяная кромка',
    description: '+10% скорость пуль',
    tags: ['ice'],
    apply: (player) => {
      player.projectileSpeedMultiplier *= 1.1
    },
  },
  {
    id: 'crit_focus',
    title: 'Крит-фокус',
    description: '+5% шанс крита',
    tags: ['crit'],
    apply: (player) => {
      player.critChance += 0.05
    },
  },
  {
    id: 'toxic_cloud',
    title: 'Токсичное облако',
    description: '+12% скорость атаки',
    tags: ['poison', 'firerate'],
    apply: (player) => {
      player.fireRateMultiplier *= 1.12
    },
  },
  {
    id: 'unlock_turret',
    title: 'Турель',
    description: 'Автоматическая турель вокруг героя',
    tags: ['turret'],
    secondaryUnlock: 'turret',
    apply: () => {},
  },
  {
    id: 'unlock_orbit_blades',
    title: 'Орбитальные клинки',
    description: 'Клинки вращаются и режут врагов',
    tags: ['blade'],
    secondaryUnlock: 'orbit_blades',
    apply: () => {},
  },
  {
    id: 'turret_upgrade',
    title: 'Усиление турели',
    description: 'Турель стреляет быстрее и сильнее',
    tags: ['turret'],
    secondaryUpgrade: 'turret',
    apply: () => {},
  },
  {
    id: 'orbit_blades_upgrade',
    title: 'Ещё клинок',
    description: '+1 орбитальный клинок',
    tags: ['blade'],
    secondaryUpgrade: 'orbit_blades',
    apply: () => {},
  },
]

export function applyLevelUp(player: PlayerConfig): void {
  player.level += 1
  player.xpToNextLevel = calcXpToNextLevel(player.level)
}
