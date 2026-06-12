import { getYsdk } from '@/yandex/sdk'
import { ensurePlayer } from '@/yandex/playerStorage'

/** Техническое имя таблицы в консоли Яндекс Игр — замените на своё. */
export const LEADERBOARD_NAME = 'leaderboard'

export interface LeaderEntry {
  rank: number
  name: string
  score: number
  isCurrentPlayer: boolean
}

interface YandexLeaderboardsApi {
  setLeaderboardScore(name: string, score: number): Promise<void>
  getLeaderboardEntries(
    name: string,
    opts?: {
      quantityTop?: number
      includeUser?: boolean
      quantityAround?: number
    },
  ): Promise<{
    entries?: Array<{
      rank: number
      score: number
      player?: { publicName?: string }
    }>
    userRank?: number
  }>
}

function getDevMockEntries(localBest = 0): LeaderEntry[] {
  const rows: Omit<LeaderEntry, 'rank'>[] = [
    { name: 'Игрок 1', score: 1000, isCurrentPlayer: false },
    { name: 'Вы', score: localBest, isCurrentPlayer: true },
    { name: 'Игрок 2', score: 500, isCurrentPlayer: false },
  ]

  return rows
    .sort((a, b) => b.score - a.score)
    .map((row, index) => ({
      ...row,
      rank: index + 1,
    }))
}

export async function submitLeaderboardScore(score: number): Promise<void> {
  const normalized = Math.floor(score)
  if (normalized <= 0) return

  const sdk = getYsdk()
  if (!sdk?.getLeaderboards) {
    if (import.meta.env.DEV) {
      console.info('[leaderboard] dev stub setScore', LEADERBOARD_NAME, normalized)
    }
    return
  }

  await ensurePlayer()

  try {
    const lb = await sdk.getLeaderboards()
    await (lb as YandexLeaderboardsApi).setLeaderboardScore(LEADERBOARD_NAME, normalized)
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[leaderboard] setLeaderboardScore failed', err)
  }
}

export async function fetchLeaderboardEntries(localBest = 0): Promise<LeaderEntry[]> {
  const sdk = getYsdk()
  if (!sdk?.getLeaderboards) {
    if (import.meta.env.DEV) return getDevMockEntries(localBest)
    return []
  }

  await ensurePlayer()

  try {
    const lb = await sdk.getLeaderboards()
    const result = await (lb as YandexLeaderboardsApi).getLeaderboardEntries(LEADERBOARD_NAME, {
      quantityTop: 10,
      includeUser: true,
      quantityAround: 3,
    })

    const userRank = result.userRank
    const entries = (result.entries ?? []).map((entry) => ({
      rank: entry.rank,
      name: entry.player?.publicName?.trim() || 'Игрок',
      score: entry.score,
      isCurrentPlayer: userRank != null && entry.rank === userRank,
    }))

    if (localBest <= 0) return entries

    return entries.map((entry) =>
      entry.isCurrentPlayer && localBest > entry.score ? { ...entry, score: localBest } : entry,
    )
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[leaderboard] getLeaderboardEntries failed', err)
    throw err
  }
}
