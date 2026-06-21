import Phaser from 'phaser'

import { FACING_DIRS, WALK_FRAME_INDICES } from '../data/playerSpritesConfig'
import { CATCHER_SPRITE_PREFIX } from '../data/catcherSpritesConfig'
import {
  DECORATOR_TEXTURE_IDS,
  DECORATOR_TEXTURE_PREFIX,
} from '../data/decoratorConfig'
import { ARENA_BG_TEXTURE_KEY } from '../data/mapConfig'
import { createMatchTextures } from '../utils/matchTextures'

const TEAM_FOLDERS = ['red', 'yellow'] as const

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload(): void {
    const baseUrl = import.meta.env.BASE_URL

    this.load.image(ARENA_BG_TEXTURE_KEY, `${baseUrl}bg.png`)

    for (const folder of TEAM_FOLDERS) {
      for (const dir of FACING_DIRS) {
        for (const frame of WALK_FRAME_INDICES) {
          this.load.image(
            `team-${folder}-${dir}-${frame}`,
            `${baseUrl}team/${folder}/${dir}-${frame}.png`,
          )
        }
      }
    }

    for (const dir of FACING_DIRS) {
      for (const frame of WALK_FRAME_INDICES) {
        this.load.image(
          `${CATCHER_SPRITE_PREFIX}-${dir}-${frame}`,
          `${baseUrl}lovec/${dir}-${frame}.png`,
        )
      }
    }

    for (const id of DECORATOR_TEXTURE_IDS) {
      this.load.image(
        `${DECORATOR_TEXTURE_PREFIX}-${id}`,
        `${baseUrl}decorator/${id}.png`,
      )
    }
  }

  create(): void {
    createMatchTextures(this)
    this.scene.start('MatchScene')
  }
}
