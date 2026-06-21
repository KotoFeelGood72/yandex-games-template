import { MATCH_COUNTDOWN_MS, MATCH_COUNTDOWN_STEP_MS } from '../data/matchConfig'

export class MatchCountdownSystem {
  private elapsedMs = 0

  reset(): void {
    this.elapsedMs = 0
  }

  tick(deltaMs: number): boolean {
    this.elapsedMs += deltaMs
    return this.elapsedMs >= MATCH_COUNTDOWN_MS
  }

  getCountdownDigit(): number {
    const remaining = MATCH_COUNTDOWN_MS - this.elapsedMs
    return Math.max(1, Math.ceil(remaining / MATCH_COUNTDOWN_STEP_MS))
  }

  get isActive(): boolean {
    return this.elapsedMs < MATCH_COUNTDOWN_MS
  }
}
