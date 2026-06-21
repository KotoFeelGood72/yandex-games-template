import type { Boss } from '../entities/Boss'
import type { Enemy } from '../entities/Enemy'
import type { Player } from '../entities/Player'
import type { Projectile } from '../entities/Projectile'
import { getStartingSecondaries } from '../data/secondaryWeaponsConfig'
import { ObjectPool } from '../utils/pool'
import type { EnemySpawnerSystem } from './EnemySpawnerSystem'
import { OrbitalBladesSystem } from './OrbitalBladesSystem'
import { TurretSystem } from './TurretSystem'

export class SecondaryWeaponSystem {
  private readonly turret: TurretSystem
  private readonly orbitals: OrbitalBladesSystem

  constructor(
    scene: Phaser.Scene,
    projectilePool: ObjectPool<Projectile>,
  ) {
    this.turret = new TurretSystem(scene, projectilePool)
    this.orbitals = new OrbitalBladesSystem(scene)
  }

  initForHero(heroId: string): void {
    for (const id of getStartingSecondaries(heroId)) {
      this.enable(id)
    }
  }

  enable(id: string): void {
    if (id === 'turret') this.turret.enable()
    if (id === 'orbit_blades') this.orbitals.enable()
  }

  upgrade(id: string): void {
    if (id === 'turret') this.turret.upgrade()
    if (id === 'orbit_blades') this.orbitals.addBlade()
  }

  update(
    delta: number,
    player: Player,
    enemies: Iterable<Enemy>,
    boss: Boss | null,
    spawner: EnemySpawnerSystem,
    time: number,
    onEnemyDamaged: (enemy: Enemy, damage: number) => void,
    onBossDamaged: (damage: number) => void,
  ): void {
    const mult = player.stats.damageMultiplier

    this.turret.update(delta, player, enemies, mult)
    this.orbitals.update(
      delta,
      player.sprite.x,
      player.sprite.y,
      time,
      enemies,
      boss,
      spawner,
      onEnemyDamaged,
      onBossDamaged,
      mult,
    )
  }

  reset(): void {
    this.turret.reset()
    this.orbitals.reset()
  }
}
