export type MissionTrack = 'kills' | 'gold' | 'survive' | 'bosses'

export interface MissionDefinition {
  id: string
  title: string
  target: number
  track: MissionTrack
}

export const MISSIONS: MissionDefinition[] = [
  { id: 'kills_500', title: 'Kills', target: 500, track: 'kills' },
  { id: 'gold_300', title: 'Gold', target: 300, track: 'gold' },
  { id: 'survive_20', title: 'Survive', target: 1200, track: 'survive' },
  { id: 'bosses_5', title: 'Bosses', target: 5, track: 'bosses' },
]
