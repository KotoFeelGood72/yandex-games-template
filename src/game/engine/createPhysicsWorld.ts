import Matter from 'matter-js'

import { GAME_WIDTH, GAME_HEIGHT } from '@/game/config/gameConfig'
import { physicsConfig } from '@/game/config/physicsConfig'

export interface PhysicsWorld {
  engine: Matter.Engine
  world: Matter.World
}

export function createPhysicsWorld(): PhysicsWorld {
  const engine = Matter.Engine.create({
    gravity: { x: physicsConfig.gravityX, y: physicsConfig.gravityY },
    enableSleeping: false,
  })
  const world = engine.world
  const t = physicsConfig.wallThickness

  const walls = [
    Matter.Bodies.rectangle(-t / 2, GAME_HEIGHT / 2, t, GAME_HEIGHT * 2, {
      isStatic: true,
      friction: physicsConfig.wallFriction,
      restitution: physicsConfig.wallRestitution,
      label: 'wall-left',
    }),
    Matter.Bodies.rectangle(GAME_WIDTH + t / 2, GAME_HEIGHT / 2, t, GAME_HEIGHT * 2, {
      isStatic: true,
      friction: physicsConfig.wallFriction,
      restitution: physicsConfig.wallRestitution,
      label: 'wall-right',
    }),
    Matter.Bodies.rectangle(GAME_WIDTH / 2, GAME_HEIGHT + t / 2, GAME_WIDTH * 2, t, {
      isStatic: true,
      friction: physicsConfig.wallFriction,
      restitution: physicsConfig.wallRestitution,
      label: 'wall-floor',
    }),
  ]

  Matter.World.add(world, walls)

  return { engine, world }
}
