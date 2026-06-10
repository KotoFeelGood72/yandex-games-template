import { fallEffectPlayer } from '@/game/effects/fallEffectPlayer'
import { preloadCatSprites } from '@/game/assets/catSprites'
import { preloadAudio } from '@/audio/sounds'
import { usePlayerStore } from '@/stores/playerStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { markAppReady } from '@/yandex/appReady'
import { initYandex } from '@/yandex/sdk'

const MIN_BOOT_MS = 1600

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export async function runAppBoot(onProgress?: (value: number) => void): Promise<void> {
  const bootStart = performance.now()
  let actualProgress = 0.04
  let tickerId = 0

  const publish = () => {
    const elapsed = performance.now() - bootStart
    const timeRatio = Math.min(1, elapsed / MIN_BOOT_MS)
    const timeFloor = 0.08 + timeRatio * 0.82
    const shown = Math.min(1, Math.max(actualProgress, timeFloor * 0.92))
    onProgress?.(shown)
  }

  tickerId = window.setInterval(publish, 40)
  publish()

  actualProgress = 0.08
  await initYandex()
  actualProgress = 0.28
  publish()

  useSettingsStore()
  const player = usePlayerStore()

  await player.loadProgress()
  actualProgress = 0.52
  publish()

  preloadAudio()

  await Promise.all([preloadCatSprites(), fallEffectPlayer.preload()])
  actualProgress = 0.9
  publish()

  const elapsed = performance.now() - bootStart
  if (elapsed < MIN_BOOT_MS) {
    await wait(MIN_BOOT_MS - elapsed)
  }

  actualProgress = 1
  publish()
  onProgress?.(1)

  window.clearInterval(tickerId)
  markAppReady()
}
