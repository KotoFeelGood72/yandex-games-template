// Ads orchestration: cooldowns, dev stubs, pause / mute lifecycle.
// Game loop pause + audio mute are dispatched via window CustomEvents so
// non-Vue code (this module) doesn't need to import the game/store.

import { ref, readonly } from 'vue'
import { getServerTime, getSessionStartMs, getYsdk } from '@/yandex/sdk'

const FIRST_AD_GAP = 60_000 // no interstitial in first minute (Yandex requirement)
const INTERSTITIAL_MIN_GAP = 90_000 // our cooldown — 30s stricter than SDK
const USER_INTERSTITIAL_MIN_GAP = 30_000 // минимум между рекламами по явному действию игрока
const INTER_TO_REWARD_GAP = 30_000 // don't pile ads back-to-back

export interface InterstitialOptions {
  /** Явный клик игрока (новая игра, рестарт) — не блокировать FIRST_AD_GAP */
  userInitiated?: boolean
  /** Плановая реклама в геймплее (каждые 2 мин) */
  scheduled?: boolean
}

let lastInterstitialAt = 0
let lastAnyAdAt = 0
let startupAdShown = false
const adPlaying = ref(false)

function emitPause() {
  adPlaying.value = true
  window.dispatchEvent(new CustomEvent('ads:pause'))
}
function emitResume() {
  adPlaying.value = false
  window.dispatchEvent(new CustomEvent('ads:resume'))
}

export const adPlayingRef = readonly(adPlaying)

export function adsPlaying(): boolean {
  return adPlaying.value
}

/** Минимальная пауза после любой рекламы перед UI (оценка, подсказки). */
const UI_AFTER_AD_GAP = 5_000

export function msSinceLastAd(): number {
  if (lastAnyAdAt === 0) return Number.POSITIVE_INFINITY
  return getServerTime() - lastAnyAdAt
}

/**
 * Выполнить callback, когда реклама не идёт и прошёл буфер после последнего показа.
 */
export function runWhenSafeFromAds(fn: () => void): void {
  const attempt = () => {
    if (adsPlaying()) {
      window.addEventListener(
        'ads:resume',
        () => window.setTimeout(attempt, UI_AFTER_AD_GAP),
        { once: true },
      )
      return
    }
    const elapsed = msSinceLastAd()
    if (elapsed < UI_AFTER_AD_GAP) {
      window.setTimeout(attempt, UI_AFTER_AD_GAP - elapsed)
      return
    }
    fn()
  }
  attempt()
}

export function canShowInterstitial(options?: InterstitialOptions): boolean {
  if (adPlaying.value) return false

  const userInitiated = options?.userInitiated === true
  const scheduled = options?.scheduled === true
  if (import.meta.env.DEV && (userInitiated || scheduled)) return true

  const now = getServerTime()
  if (!userInitiated && now - getSessionStartMs() < FIRST_AD_GAP) return false

  const minGap = userInitiated ? USER_INTERSTITIAL_MIN_GAP : INTERSTITIAL_MIN_GAP
  if (now - lastInterstitialAt < minGap) return false
  if (now - lastAnyAdAt < INTER_TO_REWARD_GAP) return false
  return true
}

function createFullscreenCallbacks(onDone: () => void) {
  let pauseEmitted = false
  const pauseOnce = () => {
    if (pauseEmitted) return
    pauseEmitted = true
    emitPause()
  }
  const resumeOnce = () => {
    if (pauseEmitted) emitResume()
  }
  const finish = () => {
    resumeOnce()
    try {
      onDone()
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[ads] interstitial onDone failed', err)
    }
  }

  return {
    onOpen: pauseOnce,
    onClose: () => finish(),
    onError: () => finish(),
    onOffline: () => finish(),
  }
}

/**
 * Полноэкранная реклама при первом открытии игры в сессии.
 * Не ждёт минутный кулдаун — показывается сразу после загрузки.
 */
export function showStartupInterstitial(onDone?: () => void): void {
  const finish = () => {
    try {
      onDone?.()
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[ads] startup onDone failed', err)
    }
  }

  if (startupAdShown || adPlaying.value) {
    finish()
    return
  }

  startupAdShown = true
  lastInterstitialAt = getServerTime()
  lastAnyAdAt = lastInterstitialAt

  const ysdk = getYsdk()
  if (!ysdk) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('[ads] startup interstitial (dev stub)')
    }
    finish()
    return
  }

  try {
    ysdk.adv.showFullscreenAdv({
      callbacks: createFullscreenCallbacks(finish),
    })
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[ads] startup interstitial failed', err)
    finish()
  }
}

/**
 * Try to show a fullscreen interstitial. No-op if cooldown is not satisfied
 * or the SDK is unavailable. Always safe to call.
 */
export function showInterstitial(_reason?: string, options?: InterstitialOptions): void {
  showInterstitialThen(() => {}, _reason, options)
}

/**
 * Показать полноэкранную рекламу, затем выполнить callback.
 * Если кулдаун не прошёл или SDK недоступен — callback вызывается сразу.
 */
export function showInterstitialThen(
  onDone: () => void,
  reason?: string,
  options?: InterstitialOptions,
): void {
  const finish = () => {
    try {
      onDone()
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[ads] interstitial onDone failed', err)
    }
  }

  if (!canShowInterstitial(options)) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('[ads] interstitial skipped (cooldown)', reason)
    }
    finish()
    return
  }

  lastInterstitialAt = getServerTime()
  lastAnyAdAt = lastInterstitialAt

  const ysdk = getYsdk()
  if (!ysdk) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('[ads] interstitial (dev stub)', reason)
    }
    finish()
    return
  }

  try {
    ysdk.adv.showFullscreenAdv({
      callbacks: createFullscreenCallbacks(finish),
    })
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[ads] interstitial failed', err)
    finish()
  }
}

/**
 * Show a rewarded video. Reward is delivered ONLY if onRewarded fires.
 * In dev (no SDK), reward is granted immediately for testing.
 */
export function showRewarded(onReward: () => void): void {
  if (adPlaying.value) return
  lastAnyAdAt = getServerTime()

  const ysdk = getYsdk()
  if (!ysdk) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('[ads] rewarded (dev stub) — granting immediately')
      onReward()
    }
    return
  }

  let granted = false
  let pauseEmitted = false
  const pauseOnce = () => {
    if (pauseEmitted) return
    pauseEmitted = true
    emitPause()
  }
  const resumeOnce = () => {
    if (pauseEmitted) emitResume()
  }

  try {
    ysdk.adv.showRewardedVideo({
      callbacks: {
        onOpen: pauseOnce,
        onRewarded: () => {
          granted = true
        },
        onClose: () => {
          resumeOnce()
          if (granted) onReward()
        },
        onError: () => {
          resumeOnce()
        },
      },
    })
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[ads] rewarded failed', err)
    resumeOnce()
  }
}
