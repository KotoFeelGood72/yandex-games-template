import { usePlayerStore } from '@/stores/playerStore'
import { syncLeaderboardBest } from '@/yandex/leaderboard'

let bound = false

function flushProgressAndLeaderboard(): void {
  const player = usePlayerStore()
  player.flushProgressNow()
  void syncLeaderboardBest(player.progress.bestScore)
}

/** Сохранить прогресс и рекорд при сворачивании / закрытии вкладки. */
export function bindProgressLifecycle(): void {
  if (bound) return
  bound = true

  const onHide = (): void => {
    flushProgressAndLeaderboard()
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') onHide()
  })

  window.addEventListener('pagehide', onHide)
  window.addEventListener('freeze', onHide as EventListener)
}
