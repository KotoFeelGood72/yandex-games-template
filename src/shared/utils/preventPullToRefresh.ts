/** Блокирует нативный pull-to-refresh и скролл страницы (требование платформы, п. 1.10). */
export function bindPreventPullToRefresh(): void {
  if (typeof window === 'undefined' || !('ontouchstart' in window)) return

  document.addEventListener(
    'touchmove',
    (event) => {
      if (event.touches.length > 1) {
        event.preventDefault()
        return
      }

      event.preventDefault()
    },
    { passive: false },
  )
}
