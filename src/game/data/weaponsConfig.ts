export interface WeaponConfig {
  id: string
  name: string
  damage: number
  fireRate: number
  projectileSpeed: number
  projectileLifetime: number
  pierce: number
  projectileCount: number
  spreadAngle: number
}

export const ENERGY_BOLT: WeaponConfig = {
  id: 'energy_bolt',
  name: 'Energy Bolt',
  damage: 10,
  fireRate: 0.45,
  projectileSpeed: 450,
  projectileLifetime: 1400,
  pierce: 0,
  projectileCount: 1,
  spreadAngle: 0,
}
