import { createWaveConfig, WAVE_DURATION } from '../data/wavesConfig'
import { getWaveEvent, isBossWave } from '../data/waveEventsConfig'

export class WaveSystem {
  index = 1
  elapsedMs = 0
  durationMs = WAVE_DURATION * 1000

  reset(): void {
    this.index = 1
    this.elapsedMs = 0
    this.durationMs = WAVE_DURATION * 1000
  }

  update(delta: number): boolean {
    this.elapsedMs += delta
    if (this.elapsedMs < this.durationMs) return false

    this.index += 1
    this.elapsedMs = 0
    this.durationMs = createWaveConfig(this.index).duration * 1000
    return true
  }

  getProgress(): number {
    return this.elapsedMs / this.durationMs
  }

  isBossWave(): boolean {
    return isBossWave(this.index)
  }

  getWaveEventLabel(): string {
    return getWaveEvent(this.index).label
  }
}
