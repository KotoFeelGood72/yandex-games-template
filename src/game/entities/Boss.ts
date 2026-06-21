import Phaser from 'phaser'

import type { BossDefinition } from '../data/bossesConfig'
import { BOSS_CONFIG } from '../data/bossConfig'
import { EntityHpBar } from '../utils/EntityHpBar'

export class Boss {
  readonly sprite: Phaser.GameObjects.Arc
  readonly body: Phaser.Physics.Arcade.Body
  readonly hpBar: EntityHpBar

  active = false
  bossId = ''
  bossName = ''
  hp = 0
  maxHp = 0
  speed = 35
  damage = 25
  xpReward = 50
  dashUntil = 0
  volleyCooldownMs = 0

  constructor(scene: Phaser.Scene) {
    this.sprite = scene.add.circle(0, 0, 36, 0xff2266)
    scene.physics.add.existing(this.sprite)
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body
    this.body.setCircle(36)
    this.sprite.setActive(false).setVisible(false)
    this.hpBar = new EntityHpBar(scene, { widthFactor: 1.8, height: 6, offsetY: 10, depth: 12 })
  }

  spawn(x: number, y: number, definition: BossDefinition, waveIndex: number): void {
    const tier = waveIndex >= 15 ? Math.max(1, Math.floor(waveIndex / 15)) : 1

    this.active = true
    this.bossId = definition.id
    this.bossName = definition.name
    this.maxHp = Math.floor(definition.hp * (1 + (tier - 1) * definition.hpScalePerTier))
    this.hp = this.maxHp
    this.speed = definition.speed
    this.damage = definition.damage
    this.xpReward = definition.xpReward
    this.dashUntil = 0
    this.volleyCooldownMs = 0

    this.sprite.setRadius(definition.radius)
    this.body.setCircle(definition.radius)
    this.sprite.setFillStyle(definition.color)
    this.sprite.setPosition(x, y)
    this.sprite.setActive(true).setVisible(true)
    this.body.setVelocity(0, 0)

    this.hpBar.attach(definition.radius)
    this.syncHpBar()
  }

  reset(): void {
    this.active = false
    this.hp = 0
    this.bossId = ''
    this.bossName = ''
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
    this.sprite.setScale(0.92)
    return this.hp <= 0
  }

  recoverScale(): void {
    this.sprite.setScale(1)
  }

  isDashing(time: number): boolean {
    return time < this.dashUntil
  }

  startDash(time: number): void {
    this.dashUntil = time + BOSS_CONFIG.dashDurationMs
  }
}
