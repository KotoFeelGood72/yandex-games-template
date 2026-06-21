export interface SecondaryWeaponConfig {
  id: string
  name: string
  maxLevel: number
}

export interface TurretStats {
  damage: number
  fireRate: number
  projectileSpeed: number
  range: number
}

export interface OrbitalStats {
  damage: number
  bladeCount: number
  orbitRadius: number
  rotationSpeed: number
  hitCooldownMs: number
}

export const TURRET_BASE: TurretStats = {
  damage: 6,
  fireRate: 0.9,
  projectileSpeed: 380,
  range: 320,
}

export const ORBITAL_BASE: OrbitalStats = {
  damage: 8,
  bladeCount: 2,
  orbitRadius: 72,
  rotationSpeed: 0.0028,
  hitCooldownMs: 350,
}

export const SECONDARY_WEAPONS: Record<string, SecondaryWeaponConfig> = {
  turret: { id: 'turret', name: 'Турель', maxLevel: 5 },
  orbit_blades: { id: 'orbit_blades', name: 'Орбитальные клинки', maxLevel: 5 },
}

export function getStartingSecondaries(heroId: string): string[] {
  if (heroId === 'engineer') return ['turret']
  return []
}
