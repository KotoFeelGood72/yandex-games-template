import {
  GOLDEN_SPAWN_AT_MS,
  MATCH_DURATION_MS,
  TRADER_INTERVAL_MS,
} from '../data/matchConfig'

export type MatchPhase = 'early' | 'trade-1' | 'mid' | 'trade-2' | 'final'

export class MatchTimerSystem {
  elapsedMs = 0
  finished = false
  goldenSpawned = false

  get remainingMs(): number {
    return Math.max(0, MATCH_DURATION_MS - this.elapsedMs)
  }

  get progress(): number {
    return Math.min(1, this.elapsedMs / MATCH_DURATION_MS)
  }

  get phase(): MatchPhase {
    if (this.elapsedMs < TRADER_INTERVAL_MS) return 'early'
    if (this.elapsedMs < TRADER_INTERVAL_MS * 2) return 'trade-1'
    if (this.elapsedMs < GOLDEN_SPAWN_AT_MS) return 'mid'
    if (this.elapsedMs < MATCH_DURATION_MS) return 'final'
    return 'final'
  }

  tick(deltaMs: number): boolean {
    if (this.finished) return true

    this.elapsedMs += deltaMs
    if (this.elapsedMs >= MATCH_DURATION_MS) {
      this.finished = true
      this.elapsedMs = MATCH_DURATION_MS
      return true
    }

    return false
  }

  shouldSpawnGolden(): boolean {
    if (this.goldenSpawned) return false
    if (this.elapsedMs >= GOLDEN_SPAWN_AT_MS) {
      this.goldenSpawned = true
      return true
    }
    return false
  }
}
