import { onUnmounted, ref, watch, type Ref } from 'vue'

import { adsPlaying, showInterstitialThen } from '@/ads/ads'
import { pauseMusic, resumeMusic } from '@/audio/sounds'
import { gameplayPause, gameplayResume, getServerTime } from '@/yandex/sdk'

const INTERVAL_MS = 120_000
const COUNTDOWN_SECONDS = 3
const TICK_MS = 250

export function useGameplayInterstitialSchedule(isPlaying: Ref<boolean>) {
  const showCountdown = ref(false)
  const countdown = ref(0)
  const isGameplayBlocked = ref(false)

  let scheduleTimer: ReturnType<typeof setTimeout> | null = null
  let countdownTimer: ReturnType<typeof setInterval> | null = null
  let nextAdAt = 0
  let countdownEndsAt = 0

  function clearScheduleTimer(): void {
    if (scheduleTimer !== null) {
      clearTimeout(scheduleTimer)
      scheduleTimer = null
    }
  }

  function clearCountdownTimer(): void {
    if (countdownTimer !== null) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }

  function finishBreak(): void {
    isGameplayBlocked.value = false
    showCountdown.value = false
    countdown.value = 0
    countdownEndsAt = 0

    if (isPlaying.value) {
      resumeMusic()
      gameplayResume()
    }
  }

  function armScheduleTimer(): void {
    clearScheduleTimer()
    if (nextAdAt <= 0 || !isPlaying.value || isGameplayBlocked.value) return

    const tick = (): void => {
      if (!isPlaying.value || isGameplayBlocked.value) return

      const remaining = nextAdAt - getServerTime()
      if (remaining <= 0) {
        scheduleTimer = null
        startCountdown()
        return
      }

      scheduleTimer = setTimeout(tick, Math.min(TICK_MS, remaining))
    }

    tick()
  }

  function scheduleNext(): void {
    clearScheduleTimer()
    if (!isPlaying.value || isGameplayBlocked.value) return

    nextAdAt = getServerTime() + INTERVAL_MS
    armScheduleTimer()
  }

  function showAdAfterCountdown(): void {
    showCountdown.value = false
    countdown.value = 0
    countdownEndsAt = 0
    clearCountdownTimer()

    showInterstitialThen(
      () => {
        finishBreak()
        scheduleNext()
      },
      'scheduled_gameplay',
      { scheduled: true },
    )
  }

  function syncCountdownFromServerTime(): void {
    if (countdownEndsAt <= 0) return

    const remaining = Math.ceil((countdownEndsAt - getServerTime()) / 1000)
    if (remaining > 0) {
      countdown.value = remaining
      return
    }

    clearCountdownTimer()
    showAdAfterCountdown()
  }

  function startCountdown(): void {
    if (isGameplayBlocked.value || adsPlaying() || !isPlaying.value) {
      if (!isPlaying.value && nextAdAt > 0) {
        armScheduleTimer()
      } else {
        scheduleNext()
      }
      return
    }

    isGameplayBlocked.value = true
    showCountdown.value = true
    countdown.value = COUNTDOWN_SECONDS
    countdownEndsAt = getServerTime() + COUNTDOWN_SECONDS * 1000
    pauseMusic()
    gameplayPause()

    syncCountdownFromServerTime()
    countdownTimer = setInterval(syncCountdownFromServerTime, TICK_MS)
  }

  function resetSchedule(): void {
    clearScheduleTimer()
    clearCountdownTimer()
    showCountdown.value = false
    countdown.value = 0
    countdownEndsAt = 0

    if (isGameplayBlocked.value) {
      isGameplayBlocked.value = false
      if (isPlaying.value) {
        resumeMusic()
        gameplayResume()
      }
    }

    scheduleNext()
  }

  function stopSchedule(): void {
    clearScheduleTimer()
    clearCountdownTimer()
    showCountdown.value = false
    countdown.value = 0
    countdownEndsAt = 0
    nextAdAt = 0

    if (isGameplayBlocked.value) {
      isGameplayBlocked.value = false
    }
  }

  function pauseSchedule(): void {
    clearScheduleTimer()
    clearCountdownTimer()
    showCountdown.value = false
    countdown.value = 0
    countdownEndsAt = 0

    if (isGameplayBlocked.value) {
      isGameplayBlocked.value = false
    }
  }

  watch(isPlaying, (playing, wasPlaying) => {
    if (playing) {
      if (wasPlaying === false) {
        if (nextAdAt > 0) {
          armScheduleTimer()
        } else {
          scheduleNext()
        }
      }
      return
    }

    pauseSchedule()
  })

  onUnmounted(() => {
    stopSchedule()
  })

  return {
    showCountdown,
    countdown,
    isGameplayBlocked,
    resetSchedule,
  }
}
