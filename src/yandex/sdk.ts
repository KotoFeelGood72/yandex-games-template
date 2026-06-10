// Thin wrapper around the Yandex Games SDK.
// In dev (or any page without window.YaGames) returns null and we fall back
// to dev stubs in the ads module.

export interface YsdkFullscreenCallbacks {
  onOpen?: () => void
  onClose?: (wasShown: boolean) => void
  onError?: (err: unknown) => void
  onOffline?: () => void
}

export interface YsdkRewardedCallbacks {
  onOpen?: () => void
  onRewarded?: () => void
  onClose?: () => void
  onError?: (err: unknown) => void
}

export interface YsdkAdv {
  showFullscreenAdv(opts: { callbacks?: YsdkFullscreenCallbacks }): void
  showRewardedVideo(opts: { callbacks?: YsdkRewardedCallbacks }): void
}

export interface YsdkEnvironment {
  app?: { id?: string }
  browser?: { lang?: string }
  i18n: { lang: string; tld: string }
  payload?: string
}

export interface YsdkFeedback {
  canReview(): Promise<{ value: boolean; reason?: string }>
  requestReview(): Promise<{ feedbackSent: boolean }>
}

export interface Ysdk {
  adv: YsdkAdv
  environment: YsdkEnvironment
  feedback?: YsdkFeedback
  features?: {
    LoadingAPI?: { ready: () => void }
    GameplayAPI?: { start: () => void; stop: () => void }
  }
  getPlayer?(opts?: { scopes?: boolean }): Promise<YsdkPlayer>
  getLeaderboards?(): Promise<unknown>
  on?(event: 'game_api_pause' | 'game_api_resume', callback: () => void): void
  off?(event: 'game_api_pause' | 'game_api_resume', callback: () => void): void
  /** Серверное время в мс — защищено от подмены системных часов. */
  serverTime(): number
}

export interface YsdkPlayer {
  getUniqueID(): string
  getName(): string
  getData(): Promise<Record<string, unknown>>
  setData(data: Record<string, unknown>, flush?: boolean): Promise<void>
}

let ysdk: Ysdk | null = null
let lang: string = 'ru'
let initPromise: Promise<Ysdk | null> | null = null
let sessionStartMs: number | null = null

/** Серверное время Yandex SDK; в dev без SDK — локальное время. */
export function getServerTime(): number {
  try {
    return ysdk?.serverTime() ?? Date.now()
  } catch {
    return Date.now()
  }
}

/** Момент старта сессии по серверному времени (для кулдаунов рекламы). */
export function getSessionStartMs(): number {
  if (sessionStartMs === null) {
    sessionStartMs = getServerTime()
  }
  return sessionStartMs
}

function bindPlatformPauseEvents(sdk: Ysdk): void {
  if (typeof sdk.on !== 'function') return

  const onPause = (): void => {
    window.dispatchEvent(new CustomEvent('platform:pause'))
  }
  const onResume = (): void => {
    window.dispatchEvent(new CustomEvent('platform:resume'))
  }

  sdk.on('game_api_pause', onPause)
  sdk.on('game_api_resume', onResume)
}

/**
 * Wait for `window.YaGames` to become available. The SDK <script> tag is
 * synchronous in index.html, so it should be ready by the time this runs,
 * but we poll briefly to be resilient against slow networks / CDN hiccups.
 */
function waitForYaGames(timeoutMs = 5000): Promise<unknown | null> {
  if ((window as any).YaGames) return Promise.resolve((window as any).YaGames)
  return new Promise((resolve) => {
    const start = Date.now()
    const id = window.setInterval(() => {
      if ((window as any).YaGames) {
        clearInterval(id)
        resolve((window as any).YaGames)
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(id)
        resolve(null)
      }
    }, 50)
  })
}

export function initYandex(): Promise<Ysdk | null> {
  if (initPromise) return initPromise

  const p: Promise<Ysdk | null> = waitForYaGames().then((YaGames: any) => {
    if (!YaGames || typeof YaGames.init !== 'function') {
      if (import.meta.env.DEV) {
        console.info('[yandex sdk] YaGames not present — running without SDK (dev mode ok)')
      }
      return null
    }
    return YaGames.init()
      .then((sdk: Ysdk) => {
        ysdk = sdk
        sessionStartMs = getServerTime()
        const detected = sdk.environment?.i18n?.lang
        if (detected) lang = detected
        bindPlatformPauseEvents(sdk)
        if (import.meta.env.DEV) {
          console.info('[yandex sdk] initialized', { lang, env: sdk.environment })
        }
        return sdk
      })
      .catch((err: unknown) => {
        if (import.meta.env.DEV) console.warn('[yandex sdk] init failed', err)
        return null
      })
  })

  initPromise = p
  return p
}

export function getYsdk(): Ysdk | null {
  return ysdk
}

export function isYsdkReady(): boolean {
  return ysdk !== null
}

/** Язык игрока, полученный из ysdk.environment.i18n.lang. Дефолт — 'ru' до инициализации/в dev. */
export function getLang(): string {
  return lang
}

// Reference-counted gameplay state. Yandex's GameplayAPI must see strictly
// alternating start/stop calls — if we naively call start/stop from each
// source (modal, ad, visibility) they overlap and Yandex ends up "stuck".
// Instead we track pause depth and only emit start when ALL pause sources
// have resumed.

let gameplayInitDone = false
let gameplayPauseDepth = 0
let gameplayLastSent: 'start' | 'stop' | null = null

function syncGameplay() {
  if (!gameplayInitDone) return
  const want: 'start' | 'stop' = gameplayPauseDepth === 0 ? 'start' : 'stop'
  if (want === gameplayLastSent) return
  gameplayLastSent = want
  try {
    if (want === 'start') ysdk?.features?.GameplayAPI?.start()
    else ysdk?.features?.GameplayAPI?.stop()
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[yandex sdk] GameplayAPI.' + want + '() failed', err)
    }
  }
}

/** Call ONCE when the game is ready to start. Subsequent calls are no-ops. */
export function gameplayInit(): void {
  if (gameplayInitDone) return
  gameplayInitDone = true
  syncGameplay()
}

/** Reference-counted. Push for every pause source (modal open, ad shown, tab hidden). */
export function gameplayPause(): void {
  gameplayPauseDepth++
  syncGameplay()
}

/** Reference-counted. Pop when a pause source resolves (modal closed, ad closed, tab visible). */
export function gameplayResume(): void {
  if (gameplayPauseDepth === 0) return
  gameplayPauseDepth--
  syncGameplay()
}

let reviewRequested = false

/** Можно ли показать нашу модалку с предложением оценить (без вызова SDK-диалога). */
export async function checkCanReview(): Promise<boolean> {
  if (reviewRequested) return false
  const sdk = getYsdk()
  if (!sdk?.feedback) return import.meta.env.DEV
  try {
    const { value } = await sdk.feedback.canReview()
    return value
  } catch {
    return false
  }
}

/** Нативное окно оценки Яндекс Игр (после нажатия «Оценить» в нашей модалке). */
export async function openPlatformReview(): Promise<boolean> {
  if (reviewRequested) return false
  const sdk = getYsdk()
  if (!sdk?.feedback) {
    if (import.meta.env.DEV) {
      reviewRequested = true
      console.info('[yandex sdk] review (dev stub)')
      return true
    }
    return false
  }
  try {
    const { value, reason } = await sdk.feedback.canReview()
    if (!value) {
      if (import.meta.env.DEV) console.info('[yandex sdk] review unavailable:', reason)
      return false
    }
    reviewRequested = true
    const { feedbackSent } = await sdk.feedback.requestReview()
    if (import.meta.env.DEV) console.info('[yandex sdk] review sent:', feedbackSent)
    return feedbackSent
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[yandex sdk] requestReview failed', err)
    reviewRequested = false
    return false
  }
}

/** @deprecated Используйте checkCanReview + openPlatformReview */
export async function tryRequestReview(): Promise<void> {
  if (!(await checkCanReview())) return
  await openPlatformReview()
}