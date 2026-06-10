import { initYandex, getYsdk, type YsdkPlayer } from '@/yandex/sdk'

export const SAVE_DATA_KEY = 'quadro2048'
export const FLAGS_KEY = 'quadro2048_flags'
const DEV_LS_KEY = 'quadro-2048-save'
const DEV_FLAGS_LS = 'quadro-2048-flags'

/** Яндекс SDK: не чаще ~20 запросов setData за 5 минут */
const SET_DATA_MIN_GAP_MS = 15_000

export interface PlayerFlags {
  controlsTutorialSeen?: boolean
}

export interface GameSaveData {
  version: 1
  best: number
  maxTileReached: number
  score: number
  tiles: Array<{ id: number; value: number; row: number; col: number }>
  won: boolean
  keepPlaying: boolean
  gameOver: boolean
}

let cachedPlayer: YsdkPlayer | null = null
let playerPromise: Promise<YsdkPlayer | null> | null = null
let playerBlob: Record<string, unknown> | null = null
let playerBlobPromise: Promise<Record<string, unknown>> | null = null
let pendingFlush = false
let writeTimer: ReturnType<typeof setTimeout> | null = null
let lastSetDataAt = 0
let writeInFlight = false

function shouldUseLocalStorage(): boolean {
  return import.meta.env.DEV
}

async function resolvePlayer(): Promise<YsdkPlayer | null> {
  if (cachedPlayer) return cachedPlayer
  if (playerPromise) return playerPromise

  playerPromise = (async () => {
    await initYandex()
    const sdk = getYsdk()
    if (!sdk?.getPlayer) return null
    try {
      cachedPlayer = await sdk.getPlayer({ scopes: false })
      return cachedPlayer
    } catch {
      return null
    }
  })()

  return playerPromise
}

export async function ensurePlayer(): Promise<boolean> {
  return (await resolvePlayer()) !== null
}

async function loadPlayerBlob(): Promise<Record<string, unknown>> {
  if (playerBlob) return playerBlob
  if (playerBlobPromise) return playerBlobPromise

  playerBlobPromise = (async () => {
    if (shouldUseLocalStorage()) {
      playerBlob = {}
      return playerBlob
    }

    const player = await resolvePlayer()
    if (!player?.getData) {
      playerBlob = {}
      return playerBlob
    }

    try {
      playerBlob = (await player.getData()) ?? {}
    } catch {
      playerBlob = {}
    }

    return playerBlob
  })()

  return playerBlobPromise
}

function schedulePlayerWrite(flush: boolean) {
  if (flush) pendingFlush = true

  if (writeTimer) clearTimeout(writeTimer)
  writeTimer = setTimeout(() => {
    writeTimer = null
    void flushPlayerData(pendingFlush)
  }, flush ? 0 : 3_000)
}

async function flushPlayerData(forceFlush = false): Promise<void> {
  if (shouldUseLocalStorage() || !playerBlob) return

  const player = await resolvePlayer()
  if (!player?.setData) return

  const now = Date.now()
  const shouldFlush = forceFlush || pendingFlush
  if (!shouldFlush && now - lastSetDataAt < SET_DATA_MIN_GAP_MS) {
    schedulePlayerWrite(true)
    return
  }

  if (writeInFlight) {
    schedulePlayerWrite(shouldFlush)
    return
  }

  writeInFlight = true
  pendingFlush = false

  try {
    await player.setData({ ...playerBlob }, shouldFlush)
    lastSetDataAt = Date.now()
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[playerStorage] setData failed', err)
  } finally {
    writeInFlight = false
  }
}

export async function flushPlayerDataNow(): Promise<void> {
  if (writeTimer) {
    clearTimeout(writeTimer)
    writeTimer = null
  }
  await flushPlayerData(true)
}

function parseSave(raw: unknown): GameSaveData | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Partial<GameSaveData>
  if (data.version !== 1) return null
  if (!Array.isArray(data.tiles)) return null
  if (typeof data.best !== 'number' || typeof data.maxTileReached !== 'number') return null
  return {
    version: 1,
    best: data.best,
    maxTileReached: data.maxTileReached,
    score: typeof data.score === 'number' ? data.score : 0,
    tiles: data.tiles
      .filter(
        (t): t is { id: number; value: number; row: number; col: number } =>
          Boolean(t) &&
          typeof t.id === 'number' &&
          typeof t.value === 'number' &&
          typeof t.row === 'number' &&
          typeof t.col === 'number',
      )
      .map((t) => ({ id: t.id, value: t.value, row: t.row, col: t.col })),
    won: Boolean(data.won),
    keepPlaying: Boolean(data.keepPlaying),
    gameOver: Boolean(data.gameOver),
  }
}

export async function loadGameProgress(): Promise<GameSaveData | null> {
  if (shouldUseLocalStorage()) {
    try {
      const raw = localStorage.getItem(DEV_LS_KEY)
      if (!raw) return null
      return parseSave(JSON.parse(raw))
    } catch {
      return null
    }
  }

  const blob = await loadPlayerBlob()
  return parseSave(blob[SAVE_DATA_KEY])
}

export async function saveGameProgress(save: GameSaveData, flush = false): Promise<void> {
  if (shouldUseLocalStorage()) {
    try {
      localStorage.setItem(DEV_LS_KEY, JSON.stringify(save))
    } catch {
      /* ignore */
    }
    return
  }

  const blob = await loadPlayerBlob()
  blob[SAVE_DATA_KEY] = save
  schedulePlayerWrite(flush)
}

/** Для dev-mock лидерборда. */
export function loadDevBestScore(): number {
  if (!import.meta.env.DEV) return 0
  try {
    const raw = localStorage.getItem(DEV_LS_KEY)
    if (!raw) return 0
    const parsed = parseSave(JSON.parse(raw))
    return parsed?.best ?? 0
  } catch {
    return 0
  }
}

async function loadFlagsRaw(): Promise<PlayerFlags> {
  if (shouldUseLocalStorage()) {
    try {
      const raw = localStorage.getItem(DEV_FLAGS_LS)
      if (!raw) return {}
      const parsed = JSON.parse(raw) as unknown
      return parsed && typeof parsed === 'object' ? (parsed as PlayerFlags) : {}
    } catch {
      return {}
    }
  }

  const blob = await loadPlayerBlob()
  const flags = blob[FLAGS_KEY]
  if (!flags || typeof flags !== 'object') return {}
  return flags as PlayerFlags
}

async function saveFlagsRaw(flags: PlayerFlags, flush = false): Promise<void> {
  if (shouldUseLocalStorage()) {
    try {
      localStorage.setItem(DEV_FLAGS_LS, JSON.stringify(flags))
    } catch {
      /* ignore */
    }
    return
  }

  const blob = await loadPlayerBlob()
  blob[FLAGS_KEY] = flags
  schedulePlayerWrite(flush)
}

export async function hasSeenControlsTutorial(): Promise<boolean> {
  const flags = await loadFlagsRaw()
  return Boolean(flags.controlsTutorialSeen)
}

export async function markControlsTutorialSeen(): Promise<void> {
  const flags = await loadFlagsRaw()
  await saveFlagsRaw({ ...flags, controlsTutorialSeen: true }, true)
}

