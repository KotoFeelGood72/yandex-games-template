import Phaser from 'phaser'

import { Enemy } from '../entities/Enemy'
import {
  MAX_ALIVE_ENEMIES,
  SPAWN_OFFSET_MAX,
  SPAWN_OFFSET_MIN,
  createWaveConfig,
  type WaveConfig,
} from '../data/wavesConfig'
import type { ArenaBounds } from '../data/arenaConfig'
import { ENEMY_TYPES } from '../data/enemiesConfig'
import { ObjectPool } from '../utils/pool'
import { randomRange } from '../utils/random'
import type { ArenaSystem } from './ArenaSystem'

export class EnemySpawnerSystem {
  private readonly pool: ObjectPool<Enemy>
  private spawnTimer = 0
  private spentBudget = 0
  private nextEnemyId = 1
  private readonly enemyIds = new WeakMap<Enemy, number>()

  wave: WaveConfig = createWaveConfig(1)
  bossWaveActive = false
  eliteMultiplier = 1
  private arena: ArenaSystem | null = null

  constructor(scene: Phaser.Scene) {
    this.pool = new ObjectPool<Enemy>(
      () => new Enemy(scene),
      (enemy) => enemy.reset(),
      96,
    )
  }

  setWave(index: number): void {
    this.wave = createWaveConfig(index)
    this.spentBudget = 0
    this.spawnTimer = 0
    this.bossWaveActive = this.wave.boss
  }

  setArena(arena: ArenaSystem): void {
    this.arena = arena
  }

  setEliteMultiplier(value: number): void {
    this.eliteMultiplier = value
  }

  setBossWaveActive(active: boolean): void {
    this.bossWaveActive = active
  }

  spawnAt(x: number, y: number, typeId: string, waveIndex: number): Enemy {
    const enemy = this.pool.acquire()
    enemy.spawn(x, y, typeId, waveIndex)
    return enemy
  }

  getActiveEnemies(): Iterable<Enemy> {
    return this.pool.getActive()
  }

  getEnemyId(enemy: Enemy): number {
    let id = this.enemyIds.get(enemy)
    if (!id) {
      id = this.nextEnemyId++
      this.enemyIds.set(enemy, id)
    }
    return id
  }

  update(delta: number, playerX: number, playerY: number, camera: Phaser.Cameras.Scene2D.Camera): void {
    if (this.pool.activeCount >= MAX_ALIVE_ENEMIES) return
    if (this.spentBudget >= this.wave.enemyBudget) return

    this.spawnTimer -= delta
    if (this.spawnTimer > 0) return

    const typeId = this.pickEnemyType()
    const cost = ENEMY_TYPES[typeId]?.weight ?? 3
    if (this.spentBudget + cost > this.wave.enemyBudget) return

    const point = this.getSpawnPoint(camera)
    const enemy = this.pool.acquire()
    enemy.spawn(point.x, point.y, typeId, this.wave.index)

    if (this.eliteMultiplier > 1 && Math.random() < 0.45) {
      enemy.maxHp *= this.eliteMultiplier
      enemy.hp = enemy.maxHp
      enemy.damage *= 1.15
      enemy.sprite.setFillStyle(0xffd54a)
    }

    enemy.chase(playerX, playerY)

    this.spentBudget += cost
    const interval = this.wave.spawnInterval * (this.bossWaveActive ? 2 : 1)
    this.spawnTimer = interval * 1000
  }

  updateEnemies(_playerX: number, _playerY: number): void {
    // Поведение обрабатывается в EnemyBehaviorSystem.
  }

  release(enemy: Enemy): void {
    this.pool.release(enemy)
  }

  clear(): void {
    for (const enemy of [...this.pool.getActive()]) {
      this.pool.release(enemy)
    }
  }

  private pickEnemyType(): string {
    const types = this.wave.enemyTypes
    const index = Math.floor(Math.random() * types.length)
    return types[index] ?? 'crawler'
  }

  private getSpawnPoint(camera: Phaser.Cameras.Scene2D.Camera): { x: number; y: number } {
    const offset = randomRange(SPAWN_OFFSET_MIN, SPAWN_OFFSET_MAX)
    const zone: ArenaBounds = this.arena
      ? this.arena.getSpawnBounds(camera, offset)
      : {
          left: camera.worldView.left - offset,
          top: camera.worldView.top - offset,
          right: camera.worldView.right + offset,
          bottom: camera.worldView.bottom + offset,
          width: 0,
          height: 0,
          centerX: 0,
          centerY: 0,
        }

    const side = Math.floor(Math.random() * 4)

    switch (side) {
      case 0:
        return { x: randomRange(zone.left, zone.right), y: zone.top }
      case 1:
        return { x: randomRange(zone.left, zone.right), y: zone.bottom }
      case 2:
        return { x: zone.left, y: randomRange(zone.top, zone.bottom) }
      default:
        return { x: zone.right, y: randomRange(zone.top, zone.bottom) }
    }
  }
}
