import type { Enemy } from '../entities/Enemy'
import type { Player } from '../entities/Player'

export class DamageSystem {
  onPlayerHit(player: Player, enemy: Enemy, time: number): boolean {
    return player.takeDamage(enemy.damage, time)
  }
}
