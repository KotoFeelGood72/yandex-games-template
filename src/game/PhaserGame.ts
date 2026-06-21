import Phaser from 'phaser'

import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from './data/mapConfig'
import { BootScene } from './scenes/BootScene'
import { MatchScene } from './scenes/MatchScene'
import { PreloadScene } from './scenes/PreloadScene'

let phaserGame: Phaser.Game | null = null

function resolveSize(parent: HTMLElement): { width: number; height: number } {
  const width = parent.clientWidth || window.innerWidth || VIEWPORT_WIDTH
  const height = parent.clientHeight || window.innerHeight || VIEWPORT_HEIGHT
  return { width, height }
}

export function createPhaserGame(parent: HTMLElement): Phaser.Game {
  destroyPhaserGame()

  const { width, height } = resolveSize(parent)

  phaserGame = new Phaser.Game({
    type: Phaser.AUTO,
    width,
    height,
    parent,
    backgroundColor: '#0a0814',
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, PreloadScene, MatchScene],
  })

  return phaserGame
}

export function resizePhaserGame(width: number, height: number): void {
  if (!phaserGame || width <= 0 || height <= 0) return
  phaserGame.scale.resize(width, height)
}

export function destroyPhaserGame(game: Phaser.Game | null = phaserGame): void {
  if (game) {
    game.destroy(true)
  }
  if (phaserGame === game) {
    phaserGame = null
  }
}

export function getPhaserGame(): Phaser.Game | null {
  return phaserGame
}
