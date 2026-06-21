import Phaser from 'phaser'

import { BOSS_CONFIG } from '../data/bossConfig'
import type { BossAttackPattern } from '../data/bossesConfig'
import { getBoss } from '../data/bossesConfig'
import { getWaveEvent } from '../data/waveEventsConfig'
import { Boss } from '../entities/Boss'
import { clamp } from '@/shared/utils/clamp'
import { randomRange } from '../utils/random'
import type { ArenaSystem } from './ArenaSystem'
import { DevourerHazardSystem } from './DevourerHazardSystem'

export type BossFireProjectile = (
  x: number,
  y: number,
  angle: number,
  speed: number,
  damage: number,
) => void

export type BossSpawnMinion = (x: number, y: number) => void

export class BossSystem {
  readonly boss: Boss
  private readonly hazards: DevourerHazardSystem
  private dashCooldownMs = 0
  private volleyCooldownMs = 0
  private specialCooldownMs = 0
  private teleportCooldownMs = 0
  private spawnedForWave = 0
  private omegaPhase = 0
  private currentPattern: BossAttackPattern = 'core'

  constructor(private readonly scene: Phaser.Scene) {
    this.boss = new Boss(scene)
    this.hazards = new DevourerHazardSystem(scene)
  }

  trySpawn(waveIndex: number, camera: Phaser.Cameras.Scene2D.Camera, arena: ArenaSystem): void {
    const event = getWaveEvent(waveIndex)
    if (event.type !== 'mini_boss' && event.type !== 'sector_boss') return
    if (this.spawnedForWave === waveIndex && this.boss.active) return
    if (this.boss.active) return

    const bossId = event.bossId ?? 'mini_core'
    const def = getBoss(bossId)
    const view = camera.worldView
    const point = {
      x: Phaser.Math.Clamp(view.centerX, arena.bounds.left + 80, arena.bounds.right - 80),
      y: arena.bounds.top + 72,
    }

    this.boss.spawn(point.x, point.y, def, waveIndex)
    this.currentPattern = def.pattern
    this.spawnedForWave = waveIndex
    this.dashCooldownMs = 2500
    this.volleyCooldownMs = 3500
    this.specialCooldownMs = 2000
    this.teleportCooldownMs = 3000
    this.omegaPhase = 0
  }

  update(
    delta: number,
    playerX: number,
    playerY: number,
    time: number,
    fireProjectile: BossFireProjectile,
    arena: ArenaSystem,
    onHazardDamage: (damage: number) => void,
    spawnMinion: BossSpawnMinion,
  ): void {
    this.hazards.update(delta, playerX, playerY, onHazardDamage)

    if (!this.boss.active) return

    this.dashCooldownMs -= delta
    this.volleyCooldownMs -= delta
    this.specialCooldownMs -= delta
    this.teleportCooldownMs -= delta
    this.boss.recoverScale()
    this.boss.syncHpBar()

    this.moveTowardPlayer(playerX, playerY, time, arena)

    const pattern = this.currentPattern === 'omega'
      ? (['devourer', 'hive', 'archon', 'destroyer'] as BossAttackPattern[])[this.omegaPhase % 4]!
      : this.currentPattern

    this.runPattern(pattern, playerX, playerY, fireProjectile, onHazardDamage, spawnMinion, arena)

    if (this.volleyCooldownMs <= 0) {
      this.fireVolley(fireProjectile)
      this.volleyCooldownMs = BOSS_CONFIG.attackCooldown * 1000 + randomRange(0, 600)
      if (this.currentPattern === 'omega') {
        this.omegaPhase += 1
      }
    }

    arena.clampBody(this.boss.body, this.boss.sprite.radius)
  }

  takeDamage(amount: number): boolean {
    if (!this.boss.active) return false
    return this.boss.takeDamage(amount)
  }

  onDeath(): void {
    this.boss.reset()
    this.hazards.clear()
  }

  reset(): void {
    this.boss.reset()
    this.hazards.clear()
    this.spawnedForWave = 0
    this.dashCooldownMs = 0
    this.volleyCooldownMs = 0
    this.specialCooldownMs = 0
    this.teleportCooldownMs = 0
    this.omegaPhase = 0
    this.currentPattern = 'core'
  }

  isActive(): boolean {
    return this.boss.active
  }

  private moveTowardPlayer(
    playerX: number,
    playerY: number,
    time: number,
    arena: ArenaSystem,
  ): void {
    const dx = playerX - this.boss.sprite.x
    const dy = playerY - this.boss.sprite.y
    const dist = Math.hypot(dx, dy) || 1
    const nx = dx / dist
    const ny = dy / dist

    if (this.boss.isDashing(time)) {
      this.boss.body.setVelocity(nx * BOSS_CONFIG.dashSpeed, ny * BOSS_CONFIG.dashSpeed)
      return
    }

    this.boss.body.setVelocity(nx * this.boss.speed, ny * this.boss.speed)

    if (this.dashCooldownMs <= 0 && dist > 80 && this.currentPattern !== 'archon') {
      this.boss.startDash(time)
      this.dashCooldownMs = 4500
    }
  }

  private runPattern(
    pattern: BossAttackPattern,
    playerX: number,
    playerY: number,
    fireProjectile: BossFireProjectile,
    onHazardDamage: (damage: number) => void,
    spawnMinion: BossSpawnMinion,
    arena: ArenaSystem,
  ): void {
    switch (pattern) {
      case 'devourer':
        if (this.specialCooldownMs <= 0) {
          this.hazards.spawnZone(this.boss.sprite.x, this.boss.sprite.y)
          this.hazards.spawnZone(playerX + randomRange(-40, 40), playerY + randomRange(-40, 40))
          this.specialCooldownMs = 2800
        }
        break

      case 'hive':
        if (this.specialCooldownMs <= 0) {
          for (let i = 0; i < 2; i++) {
            spawnMinion(
              this.boss.sprite.x + randomRange(-30, 30),
              this.boss.sprite.y + randomRange(-30, 30),
            )
          }
          this.specialCooldownMs = 4500
        }
        break

      case 'archon':
        if (this.teleportCooldownMs <= 0) {
          const angle = Math.random() * Math.PI * 2
          const dist = randomRange(100, 180)
          const tx = clamp(
            playerX + Math.cos(angle) * dist,
            arena.bounds.left + 60,
            arena.bounds.right - 60,
          )
          const ty = clamp(
            playerY + Math.sin(angle) * dist,
            arena.bounds.top + 60,
            arena.bounds.bottom - 60,
          )
          this.boss.body.center.set(tx, ty)
          this.teleportCooldownMs = 3200
          this.dashCooldownMs = 1200
        }
        break

      case 'destroyer':
        if (this.specialCooldownMs <= 0) {
          this.fireShockwave(fireProjectile)
          this.specialCooldownMs = 3800
        }
        break

      case 'core':
      default:
        break
    }
  }

  private fireVolley(fireProjectile: BossFireProjectile): void {
    for (let i = 0; i < BOSS_CONFIG.volleyCount; i++) {
      const angle = (Math.PI * 2 * i) / BOSS_CONFIG.volleyCount
      fireProjectile(
        this.boss.sprite.x,
        this.boss.sprite.y,
        angle,
        BOSS_CONFIG.projectileSpeed,
        this.boss.damage * 0.6,
      )
    }
  }

  private fireShockwave(fireProjectile: BossFireProjectile): void {
    const count = 16
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count
      fireProjectile(
        this.boss.sprite.x,
        this.boss.sprite.y,
        angle,
        BOSS_CONFIG.projectileSpeed * 0.75,
        this.boss.damage * 0.85,
      )
    }
  }
}
