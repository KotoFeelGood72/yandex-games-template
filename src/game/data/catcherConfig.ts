export interface CatcherDefinition {
  id: string
  speed: number
  patrolSpeed: number
  detectRadius: number
  chaseDurationMs: number
  catchRadius: number
  color: number
}

const CATCHER_VARIANTS: Omit<CatcherDefinition, 'id'>[] = [
  {
    speed: 145,
    patrolSpeed: 58,
    detectRadius: 220,
    chaseDurationMs: 3500,
    catchRadius: 28,
    color: 0xff3355,
  },
  {
    speed: 130,
    patrolSpeed: 52,
    detectRadius: 200,
    chaseDurationMs: 3200,
    catchRadius: 28,
    color: 0xff6644,
  },
  {
    speed: 155,
    patrolSpeed: 62,
    detectRadius: 240,
    chaseDurationMs: 3800,
    catchRadius: 28,
    color: 0xff2288,
  },
  {
    speed: 140,
    patrolSpeed: 56,
    detectRadius: 210,
    chaseDurationMs: 3400,
    catchRadius: 28,
    color: 0xff4466,
  },
]

export const CATCHER_COUNT = 8

export const CATCHERS: CatcherDefinition[] = Array.from({ length: CATCHER_COUNT }, (_, index) => {
  const variant = CATCHER_VARIANTS[index % CATCHER_VARIANTS.length]!
  return {
    id: `catcher-${index + 1}`,
    ...variant,
  }
})

/** Маршруты патруля по всей карте 3000×3000 */
export const PATROL_WAYPOINTS = [
  { x: -1200, y: -1200 },
  { x: 1200, y: -1200 },
  { x: 1200, y: 1200 },
  { x: -1200, y: 1200 },
  { x: 0, y: -1000 },
  { x: 1000, y: 0 },
  { x: 0, y: 1000 },
  { x: -1000, y: 0 },
  { x: -700, y: -700 },
  { x: 700, y: -700 },
  { x: 700, y: 700 },
  { x: -700, y: 700 },
  { x: -400, y: 0 },
  { x: 400, y: 0 },
  { x: 0, y: -400 },
  { x: 0, y: 400 },
]
