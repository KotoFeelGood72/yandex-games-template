export type StickKind = 'neon' | 'sushi' | 'golden'

export interface StickDefinition {
  kind: StickKind
  textureKey: string
  displaySize: number
  scoreValue: number
  glowColor: number
}

export const STICK_DEFINITIONS: Record<StickKind, StickDefinition> = {
  neon: {
    kind: 'neon',
    textureKey: 'stick-neon',
    displaySize: 18,
    scoreValue: 1,
    glowColor: 0x00f5ff,
  },
  sushi: {
    kind: 'sushi',
    textureKey: 'stick-sushi',
    displaySize: 22,
    scoreValue: 10,
    glowColor: 0xff44cc,
  },
  golden: {
    kind: 'golden',
    textureKey: 'stick-golden',
    displaySize: 28,
    scoreValue: 50,
    glowColor: 0xffd54a,
  },
}

export const MAX_NEON_STICKS_ON_MAP = 120
/** Доля палочек в центральной зоне (остальные — по всей карте) */
export const CENTER_SPAWN_CHANCE = 0.22
