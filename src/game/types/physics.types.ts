import type { Body } from 'matter-js'

export interface MergeObject {
  id: string
  level: number
  body: Body
  radius: number
  scoreValue: number
  isMerging: boolean
  createdAt: number
  /** Шлейф при сбросе игроком */
  showDropTrail?: boolean
}
