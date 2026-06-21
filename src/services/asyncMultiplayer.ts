import { getYsdk, initYandexSdk } from './yandexSdk'

export interface AsyncSession {
  id: string
}

export async function initAsyncMultiplayer(
  playerRating: number,
  playerLevel: number,
): Promise<AsyncSession[]> {
  const ysdk = await initYandexSdk() as {
    multiplayer?: {
      sessions?: {
        init: (opts: unknown) => Promise<Array<{ id?: string }>>
      }
    }
  } | null

  if (!ysdk?.multiplayer?.sessions) {
    console.warn('Async multiplayer unavailable. Use bot fallback.')
    return []
  }

  try {
    const opponents = await ysdk.multiplayer.sessions.init({
      count: 3,
      isEventBased: true,
      maxOpponentTurnTime: 300,
      meta: {
        meta1: {
          min: Math.max(0, playerRating - 500),
          max: playerRating + 500,
        },
        meta2: {
          min: Math.max(1, playerLevel - 3),
          max: playerLevel + 3,
        },
      },
    })

    return opponents.map((o, i) => ({ id: o.id ?? `session-${i}` }))
  } catch (e) {
    console.warn('Failed to init async multiplayer', e)
    return []
  }
}

export async function commitMultiplayerEvent(payload: unknown): Promise<void> {
  const ysdk = await initYandexSdk() as {
    multiplayer?: { sessions?: { commit: (p: unknown) => void } }
  } | null

  if (!ysdk?.multiplayer?.sessions) return

  try {
    ysdk.multiplayer.sessions.commit(payload)
  } catch (e) {
    console.warn('Failed to commit multiplayer event', e)
  }
}

export async function pushMultiplayerSession(
  score: number,
  playerLevel: number,
  teamScore: number,
): Promise<void> {
  const ysdk = await initYandexSdk() as {
    multiplayer?: { sessions?: { push: (p: unknown) => Promise<void> } }
  } | null

  if (!ysdk?.multiplayer?.sessions) return

  try {
    await ysdk.multiplayer.sessions.push({
      meta1: score,
      meta2: playerLevel,
      meta3: teamScore,
    })
  } catch (e) {
    console.warn('Failed to push multiplayer session', e)
  }
}

export async function subscribeAsyncOpponentEvents(
  onTransaction: (event: { opponentId?: string; payload?: unknown }) => void,
  onFinish: (event: unknown) => void,
): Promise<void> {
  const ysdk = await initYandexSdk() as {
    on?: (event: string, cb: (e: unknown) => void) => void
    off?: (event: string, cb: (e: unknown) => void) => void
  } | null

  if (!ysdk?.on) return

  const txHandler = (event: unknown) => onTransaction(event as { opponentId?: string; payload?: unknown })
  const finishHandler = (event: unknown) => onFinish(event)

  ysdk.on('multiplayer-sessions-transaction', txHandler)
  ysdk.on('multiplayer-sessions-finish', finishHandler)
}
