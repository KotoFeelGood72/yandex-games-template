/** Viewport Phaser */
export const VIEWPORT_WIDTH = 960
export const VIEWPORT_HEIGHT = 540

export const MAP_WIDTH = 3000
export const MAP_HEIGHT = 3000

export const ARENA_BG_TEXTURE_KEY = 'arena-bg'

export type TeamId = 'blue' | 'pink'

export interface MapPoint {
  x: number
  y: number
}

export interface MapZone extends MapPoint {
  id: string
  radius: number
}

export interface ArenaBounds {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
  centerX: number
  centerY: number
}

export const TEAM_BLUE_BASE: MapZone = { id: 'blue-base', x: -1100, y: 0, radius: 180 }
export const TEAM_PINK_BASE: MapZone = { id: 'pink-base', x: 1100, y: 0, radius: 180 }
export const CENTER_ZONE: MapZone = { id: 'center', x: 0, y: 0, radius: 420 }

/** Стартовые шеренги в центре карты: Blue слева, Pink справа */
export const MATCH_LINE_X = 140
export const MATCH_LINE_SLOT_SPACING = 48

export function getMatchLineSpawn(team: TeamId, slotIndex: number, slotCount: number): MapPoint {
  const x = team === 'blue' ? -MATCH_LINE_X : MATCH_LINE_X
  const startY = -((slotCount - 1) * MATCH_LINE_SLOT_SPACING) / 2
  return { x, y: startY + slotIndex * MATCH_LINE_SLOT_SPACING }
}

export function getMatchLineFacing(team: TeamId): MapPoint {
  return team === 'blue' ? { x: 1, y: 0 } : { x: -1, y: 0 }
}

export const TRADE_ZONES: MapZone[] = [
  { id: 'trade-n', x: 0, y: -820, radius: 240 },
  { id: 'trade-s', x: 0, y: 820, radius: 240 },
  { id: 'trade-w', x: -720, y: 0, radius: 200 },
  { id: 'trade-e', x: 720, y: 0, radius: 200 },
]

export const COVER_ZONES: MapZone[] = [
  { id: 'cover-1', x: -400, y: -500, radius: 90 },
  { id: 'cover-2', x: 420, y: 480, radius: 90 },
  { id: 'cover-3', x: -350, y: 600, radius: 80 },
  { id: 'cover-4', x: 380, y: -580, radius: 80 },
]

export function getMapBounds(): ArenaBounds {
  const left = -MAP_WIDTH / 2
  const top = -MAP_HEIGHT / 2

  return {
    left,
    top,
    right: left + MAP_WIDTH,
    bottom: top + MAP_HEIGHT,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    centerX: 0,
    centerY: 0,
  }
}

export function getTeamSpawn(team: TeamId): MapPoint {
  return getMatchLineSpawn(team, 0, 1)
}
