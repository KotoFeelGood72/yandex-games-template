import Phaser from 'phaser'

interface HazardZone {
  x: number
  y: number
  radius: number
  ttl: number
  sprite: Phaser.GameObjects.Arc
}

const ZONE_LIFETIME = 2500
const ZONE_RADIUS = 48
const ZONE_DAMAGE = 12

export class DevourerHazardSystem {
  private readonly zones: HazardZone[] = []

  constructor(private readonly scene: Phaser.Scene) {}

  spawnZone(x: number, y: number): void {
    const sprite = this.scene.add.circle(x, y, ZONE_RADIUS, 0xff2244, 0.35)
    sprite.setDepth(2)
    this.zones.push({ x, y, radius: ZONE_RADIUS, ttl: ZONE_LIFETIME, sprite })
  }

  update(
    delta: number,
    playerX: number,
    playerY: number,
    onDamage: (damage: number) => void,
  ): void {
    for (let i = this.zones.length - 1; i >= 0; i--) {
      const zone = this.zones[i]!
      zone.ttl -= delta
      zone.sprite.setAlpha(0.2 + (zone.ttl / ZONE_LIFETIME) * 0.25)

      const dist = Phaser.Math.Distance.Between(playerX, playerY, zone.x, zone.y)
      if (dist <= zone.radius) {
        onDamage(ZONE_DAMAGE * (delta / 1000))
      }

      if (zone.ttl <= 0) {
        zone.sprite.destroy()
        this.zones.splice(i, 1)
      }
    }
  }

  clear(): void {
    for (const zone of this.zones) {
      zone.sprite.destroy()
    }
    this.zones.length = 0
  }
}
