// Reusable audio wrapper for Yandex Games. Routes all sound through the
// Web Audio API instead of HTMLAudioElement so the game does NOT register
// with the browser's Media Session (Yandex requirement: no global media
// controls / lock-screen player). Audio is also auto-suspended when the
// tab is hidden.
//
// Usage in a new game:
//   1. Drop SFX files somewhere under src/assets and add them to SFX_URLS
//      below (use `as const` keys → SfxName updates automatically).
//   2. Tune SFX_VOLUMES / MIN_INTERVAL per sound.
//   3. (Optional) set a BGM track by assigning bgmUrl to its import.
//   4. Call preloadAudio() once on startup and unlockAudioOnGesture() to
//      satisfy autoplay policies.

import bgmAssetUrl from '@/assets/audio/fon.wav'

// Map of SFX name → asset URL. Empty by default — add your own sounds.
// When you add entries, narrow SfxName to `keyof typeof SFX_URLS`.
export type SfxName = string

const SFX_URLS: Record<SfxName, string> = {}

const SFX_VOLUMES: Record<SfxName, number> = {}

// Minimum gap between repeated plays of the same SFX (ms).
const MIN_INTERVAL: Record<SfxName, number> = {}

const lastPlayedAt: Record<SfxName, number> = {}

let sfxEnabled = true
let musicEnabled = true
let masterSfxVolume = 0.9
let masterMusicVolume = 0.35

let audioCtx: AudioContext | null = null
let masterSfxGain: GainNode | null = null

const sfxBuffers: Partial<Record<SfxName, AudioBuffer>> = {}
const sfxLoading: Partial<Record<SfxName, Promise<void>>> = {}

// Set to a URL (e.g. `import bgmUrl from '@/assets/audio/theme.mp3'`) to
// enable background music. Left null in the template.
const bgmUrl: string | null = bgmAssetUrl

let bgmBuffer: AudioBuffer | null = null
let bgmLoading: Promise<void> | null = null
let bgmSource: AudioBufferSourceNode | null = null
let bgmGain: GainNode | null = null
let bgmShouldPlay = false
let gameMusicPaused = false
let backgroundPaused = false
let adsPaused = false

let visibilityBound = false
let unlocked = false

function applyAudioLifecycle(): void {
  const ctx = getCtx()
  if (!ctx) return

  const suspendAll = backgroundPaused || adsPaused || document.hidden
  const stopBgm = suspendAll || gameMusicPaused || !musicEnabled

  if (stopBgm) stopBgmSource()

  if (suspendAll) {
    if (ctx.state === 'running') void ctx.suspend()
    suppressMediaSession()
    return
  }

  if (gameMusicPaused || !musicEnabled) {
    if (ctx.state === 'suspended') void ctx.resume()
    return
  }

  if (ctx.state === 'suspended') {
    void ctx.resume().then(() => {
      if (bgmShouldPlay && canPlayMusicNow() && !bgmSource) void startMusic()
    })
    return
  }

  if (bgmShouldPlay && canPlayMusicNow() && !bgmSource) {
    void startMusic()
  }
}

function pauseForBackground(): void {
  backgroundPaused = true
  applyAudioLifecycle()
}

function resumeFromBackground(): void {
  if (document.hidden) return
  backgroundPaused = false
  applyAudioLifecycle()
}

function getCtx(): AudioContext | null {
  if (audioCtx) return audioCtx
  const Ctor: typeof AudioContext | undefined =
    (window as any).AudioContext || (window as any).webkitAudioContext
  if (!Ctor) return null
  audioCtx = new Ctor()
  masterSfxGain = audioCtx.createGain()
  masterSfxGain.gain.value = masterSfxVolume
  masterSfxGain.connect(audioCtx.destination)
  return audioCtx
}

function suppressMediaSession() {
  // Chrome/Android: explicitly tell the browser we don't want a media session.
  const ms = (navigator as any).mediaSession
  if (!ms) return
  try {
    ms.metadata = null
    const actions = [
      'play',
      'pause',
      'stop',
      'seekbackward',
      'seekforward',
      'previoustrack',
      'nexttrack',
      'seekto',
    ]
    for (const a of actions) {
      try {
        ms.setActionHandler(a, null)
      } catch {}
    }
    try {
      ms.playbackState = 'none'
    } catch {}
  } catch {}
}

async function loadSfxBuffer(name: SfxName): Promise<void> {
  if (sfxBuffers[name]) return
  const ctx = getCtx()
  if (!ctx) return
  const url = SFX_URLS[name]
  if (!url) return
  if (!sfxLoading[name]) {
    sfxLoading[name] = fetch(url)
      .then((r) => r.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        sfxBuffers[name] = decoded
      })
      .catch(() => {
        // swallow — sfx just won't play
      })
  }
  await sfxLoading[name]
}

async function loadBgmBuffer(): Promise<void> {
  if (bgmBuffer || !bgmUrl) return
  const ctx = getCtx()
  if (!ctx) return
  if (!bgmLoading) {
    bgmLoading = fetch(bgmUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`BGM fetch failed: ${r.status}`)
        return r.arrayBuffer()
      })
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        bgmBuffer = decoded
      })
      .catch((err) => {
        if (import.meta.env.DEV) console.warn('[audio] failed to load BGM', err)
      })
  }
  await bgmLoading
}

function stopBgmSource() {
  if (bgmSource) {
    try {
      bgmSource.stop()
    } catch {}
    try {
      bgmSource.disconnect()
    } catch {}
    bgmSource = null
  }
}

function canPlayMusicNow(): boolean {
  return (
    musicEnabled &&
    !gameMusicPaused &&
    !document.hidden &&
    !backgroundPaused &&
    !adsPaused &&
    Boolean(bgmUrl)
  )
}

function startBgmSource() {
  const ctx = getCtx()
  if (!ctx || !bgmBuffer || bgmSource || !bgmShouldPlay || !canPlayMusicNow()) return
  if (!bgmGain) {
    bgmGain = ctx.createGain()
    bgmGain.connect(ctx.destination)
  }
  bgmGain.gain.value = masterMusicVolume
  const src = ctx.createBufferSource()
  src.buffer = bgmBuffer
  src.loop = true
  src.connect(bgmGain)
  src.start(0)
  bgmSource = src
}

function bindVisibility() {
  if (visibilityBound) return
  visibilityBound = true

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseForBackground()
    else resumeFromBackground()
  })

  window.addEventListener('blur', () => {
    pauseForBackground()
  })

  window.addEventListener('focus', () => {
    resumeFromBackground()
  })

  window.addEventListener('pagehide', () => {
    pauseForBackground()
  })

  window.addEventListener('pageshow', () => {
    resumeFromBackground()
  })

  document.addEventListener('freeze', () => {
    pauseForBackground()
  })

  window.addEventListener('platform:pause', () => {
    pauseForBackground()
  })

  window.addEventListener('platform:resume', () => {
    resumeFromBackground()
  })

  window.addEventListener('ads:pause', () => {
    adsPaused = true
    applyAudioLifecycle()
  })

  window.addEventListener('ads:resume', () => {
    adsPaused = false
    applyAudioLifecycle()
  })
}

export function preloadAudio() {
  suppressMediaSession()
  bindVisibility()
  for (const k of Object.keys(SFX_URLS) as SfxName[]) {
    void loadSfxBuffer(k)
  }
  if (bgmUrl) void loadBgmBuffer()
}

export function playSfx(name: SfxName) {
  if (!sfxEnabled) return
  if (document.hidden || backgroundPaused || adsPaused) return
  const now = performance.now()
  const gap = MIN_INTERVAL[name] ?? 0
  if (gap > 0 && now - (lastPlayedAt[name] ?? 0) < gap) return
  const ctx = getCtx()
  if (!ctx || !masterSfxGain) return
  const buffer = sfxBuffers[name]
  if (!buffer) {
    void loadSfxBuffer(name)
    return
  }
  lastPlayedAt[name] = now
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const gain = ctx.createGain()
  gain.gain.value = SFX_VOLUMES[name] ?? 1
  src.connect(gain).connect(masterSfxGain)
  src.start(0)
  src.onended = () => {
    try {
      src.disconnect()
      gain.disconnect()
    } catch {}
  }
}

export async function startMusic() {
  if (!musicEnabled || !bgmUrl) return

  bgmShouldPlay = true
  if (!canPlayMusicNow()) return

  const ctx = getCtx()
  if (!ctx) return

  await loadBgmBuffer()
  if (!bgmBuffer || !canPlayMusicNow()) return

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume()
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[audio] AudioContext resume failed', err)
      return
    }
  }

  startBgmSource()
  suppressMediaSession()
}

export function stopMusic() {
  bgmShouldPlay = false
  stopBgmSource()
}

/** Пауза BGM при паузе игры / модалках геймплея. */
export function pauseMusic() {
  gameMusicPaused = true
  applyAudioLifecycle()
}

/** Возобновить BGM после снятия игровой паузы. */
export function resumeMusic() {
  gameMusicPaused = false
  if (musicEnabled && bgmUrl) bgmShouldPlay = true
  applyAudioLifecycle()
}

export function setSfxEnabled(v: boolean) {
  sfxEnabled = v
}

export function setMusicEnabled(v: boolean) {
  musicEnabled = v
  if (v) bgmShouldPlay = true
  else stopBgmSource()
  applyAudioLifecycle()
}

export function setSfxVolume(v: number) {
  masterSfxVolume = Math.max(0, Math.min(1, v))
  if (masterSfxGain) masterSfxGain.gain.value = masterSfxVolume
}

export function setMusicVolume(v: number) {
  masterMusicVolume = Math.max(0, Math.min(1, v))
  if (bgmGain) bgmGain.gain.value = masterMusicVolume
}

export function unlockAudioOnGesture() {
  if (unlocked) return

  const tryStartMusic = () => {
    if (musicEnabled && !gameMusicPaused) void startMusic()
  }

  const events = [
    'pointerdown',
    'pointerup',
    'mousedown',
    'click',
    'keydown',
    'touchstart',
    'touchend',
    'wheel',
    'contextmenu',
  ] as const

  const handler = async () => {
    unlocked = true
    preloadAudio()

    const ctx = getCtx()
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch (err) {
        if (import.meta.env.DEV) console.warn('[audio] unlock resume failed', err)
      }
    }

    tryStartMusic()
    suppressMediaSession()

    for (const e of events) window.removeEventListener(e, handler)
  }

  for (const e of events) {
    window.addEventListener(e, handler, { passive: true })
  }
}
