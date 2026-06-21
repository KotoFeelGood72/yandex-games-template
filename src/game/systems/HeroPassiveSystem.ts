import type { Player } from '../entities/Player'
import { getHero } from '../data/heroesConfig'

export class HeroPassiveSystem {
  private baseSpeed = 180
  private barrierCooldownMs = 0

  init(player: Player, heroId: string): void {
    this.baseSpeed = player.stats.speed
    this.barrierCooldownMs = 0
    void getHero(heroId)
  }

  update(player: Player, heroId: string, time: number, lastDamageTime: number, delta: number): void {
    switch (heroId) {
      case 'wanderer':
        this.updateWanderer(player, time, lastDamageTime)
        break
      case 'guardian':
        this.updateGuardian(player, time, delta)
        break
      default:
        player.stats.speed = this.baseSpeed
    }
  }

  onDamage(player: Player): void {
    player.stats.speed = this.baseSpeed
  }

  private updateWanderer(player: Player, time: number, lastDamageTime: number): void {
    if (time - lastDamageTime >= 5000) {
      player.stats.speed = this.baseSpeed * 1.25
    } else {
      player.stats.speed = this.baseSpeed
    }
  }

  private updateGuardian(player: Player, time: number, delta: number): void {
    player.stats.speed = this.baseSpeed
    this.barrierCooldownMs -= delta
    if (this.barrierCooldownMs <= 0) {
      player.applyInvincibility(time, 700)
      this.barrierCooldownMs = 8000
    }
  }
}
