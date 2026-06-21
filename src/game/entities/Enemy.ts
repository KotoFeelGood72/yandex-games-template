import Phaser from 'phaser'

import { ENEMY_TYPES, scaleEnemyStats, type EnemyTypeConfig } from '../data/enemiesConfig'
import { EntityHpBar } from '../utils/EntityHpBar'

export class Enemy {
  readonly sprite: Phaser.GameObjects.Arc
  readonly body: Phaser.Physics.Arcade.Body
  readonly hpBar: EntityHpBar

  active = false
  typeId = 'crawler'
  hp = 0
  maxHp = 0
  speed = 0
  damage = 0
  xp = 0
  shootCooldownMs = 0

  constructor(scene: Phaser.Scene) {
    this.sprite = scene.add.circle(0, 0, 12, 0xff4444)
    scene.physics.add.existing(this.sprite)
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body
    this.body.setCircle(12)
    this.sprite.setActive(false).setVisible(false)
    this.hpBar = new EntityHpBar(scene)
  }

  spawn(x: number, y: number, typeId: string, waveIndex: number): void {
    const config = ENEMY_TYPES[typeId] ?? ENEMY_TYPES.crawler!
    const scaled = scaleEnemyStats(config, waveIndex)

    this.active = true
    this.typeId = config.id
    this.maxHp = scaled.hp
    this.hp = scaled.hp
    this.speed = scaled.speed
    this.damage = scaled.damage
    this.xp = config.xp
    this.shootCooldownMs = 0

    this.sprite.setRadius(config.radius)
    this.body.setCircle(config.radius)
    this.sprite.setFillStyle(config.color)
    this.sprite.setPosition(x, y)
    this.sprite.setActive(true).setVisible(true)
    this.body.setVelocity(0, 0)

    this.hpBar.attach(config.radius)
    this.syncHpBar()
  }

  reset(): void {
    this.active = false
    this.hp = 0
    this.shootCooldownMs = 0
    this.sprite.setActive(false).setVisible(false)
    this.body.setVelocity(0, 0)
    this.hpBar.hide()
  }

  syncHpBar(): void {
    if (!this.active) return
    this.hpBar.sync(this.sprite.x, this.sprite.y, this.sprite.radius, this.hp, this.maxHp)
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount
    this.sprite.setScale(0.9)
    return this.hp <= 0
  }

  recoverScale(): void {
    this.sprite.setScale(1)
  }

  chase(targetX: number, targetY: number): void {
    const dx = targetX - this.sprite.x
    const dy = targetY - this.sprite.y
    const len = Math.hypot(dx, dy) || 1
    this.body.setVelocity((dx / len) * this.speed, (dy / len) * this.speed)
  }
}

export function getEnemyConfig(typeId: string): EnemyTypeConfig {
  return ENEMY_TYPES[typeId] ?? ENEMY_TYPES.crawler!
}
