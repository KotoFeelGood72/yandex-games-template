import { getYsdk, initYandex, type YsdkPlayer } from '@/yandex/sdk'

export const CAT_MERGE_SAVE_KEY = 'cat_merge_progress'

/** Яндекс SDK: не чаще ~20 запросов setData за 5 минут */
const SET_DATA_MIN_GAP_MS = 15_000

let cachedPlayer: YsdkPlayer | null = null
let playerPromise: Promise<YsdkPlayer | null> | null = null
let playerBlob: Record<string, unknown> | null = null
let playerBlobPromise: Promise<Record<string, unknown>> | null = null
let pendingFlush = false
let writeTimer: ReturnType<typeof setTimeout> | null = null
let lastSetDataAt = 0
let writeInFlight = false

/** SDK шлёт данные в parent через structured clone — только plain JSON. */
function toPlainRecord(value: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>
}

function useCloudPlayer(): boolean {
  return !import.meta.env.DEV && Boolean(getYsdk()?.getPlayer)
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

export async function ensureCloudPlayer(): Promise<boolean> {
  return (await resolvePlayer()) !== null
}

async function loadPlayerBlob(): Promise<Record<string, unknown>> {
  if (playerBlob) return playerBlob
  if (playerBlobPromise) return playerBlobPromise

  playerBlobPromise = (async () => {
    if (!useCloudPlayer()) {
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

function schedulePlayerWrite(flush: boolean): void {
  if (flush) pendingFlush = true

  if (writeTimer) clearTimeout(writeTimer)
  writeTimer = setTimeout(() => {
    writeTimer = null
    void flushPlayerData(pendingFlush)
  }, flush ? 0 : 3_000)
}

async function flushPlayerData(forceFlush = false): Promise<void> {
  if (!useCloudPlayer() || !playerBlob) return

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
    await player.setData(toPlainRecord(playerBlob), shouldFlush)
    lastSetDataAt = Date.now()
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[playerCloud] setData failed', err)
  } finally {
    writeInFlight = false
  }
}

export async function loadCatMergeProgress(): Promise<Record<string, unknown> | null> {
  if (!useCloudPlayer()) return null

  const blob = await loadPlayerBlob()
  const raw = blob[CAT_MERGE_SAVE_KEY]
  if (!raw || typeof raw !== 'object') return null
  return raw as Record<string, unknown>
}

export function saveCatMergeProgress(data: Record<string, unknown>, flush = false): void {
  if (!useCloudPlayer()) return

  void loadPlayerBlob().then((blob) => {
    blob[CAT_MERGE_SAVE_KEY] = toPlainRecord(data)
    schedulePlayerWrite(flush)
  })
}

export async function flushCatMergeProgress(): Promise<void> {
  if (writeTimer) {
    clearTimeout(writeTimer)
    writeTimer = null
  }
  await flushPlayerData(true)
}
