import { getYsdk } from '@/yandex/sdk'
import { ensureCloudPlayer } from '@/yandex/playerCloud'

/** Техническое имя таблицы в консоли Яндекс Игр */
export const LEADERBOARD_NAME = 'catsboard'

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

function loadDevBestScore(): number {
  if (!import.meta.env.DEV) return 0

  try {
    const raw = localStorage.getItem('cat-merge-player')
    if (!raw) return 0
    const parsed = JSON.parse(raw) as { bestScore?: unknown }
    return typeof parsed.bestScore === 'number' ? parsed.bestScore : 0
  } catch {
    return 0
  }
}

function getDevMockEntries(): LeaderEntry[] {
  const best = loadDevBestScore()

  const rows: Omit<LeaderEntry, 'rank'>[] = [
    { name: 'Игрок 2', score: 2048, isCurrentPlayer: false },
    { name: 'Игрок 3', score: 1024, isCurrentPlayer: false },
    { name: 'Вы', score: best, isCurrentPlayer: true },
    { name: 'Игрок 4', score: 512, isCurrentPlayer: false },
    { name: 'Игрок 5', score: 256, isCurrentPlayer: false },
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
      // eslint-disable-next-line no-console
      console.info('[leaderboard] dev stub setScore', LEADERBOARD_NAME, normalized)
    }
    return
  }

  await ensureCloudPlayer()

  try {
    const lb = await sdk.getLeaderboards()
    await (lb as YandexLeaderboardsApi).setLeaderboardScore(LEADERBOARD_NAME, normalized)
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[leaderboard] setLeaderboardScore failed', err)
  }
}

/** Отправить локальный рекорд в таблицу Яндекс Игр. */
export async function syncLeaderboardBest(localBest: number): Promise<void> {
  await submitLeaderboardScore(localBest)
}

export async function fetchLeaderboardEntries(localBest = 0): Promise<LeaderEntry[]> {
  const sdk = getYsdk()
  if (!sdk?.getLeaderboards) {
    if (import.meta.env.DEV) return getDevMockEntries()
    return []
  }

  await ensureCloudPlayer()

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
