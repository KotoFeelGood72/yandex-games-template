import { getLang, getYsdk, gameplayInit } from '@/yandex/sdk'

let readyCalled = false

/** Сигнал платформе: игра загружена, игрок может начать. Вызывать после прогресса и UI. */
export function markAppReady(): void {
  if (readyCalled) return
  readyCalled = true

  document.documentElement.lang = getLang()

  try {
    getYsdk()?.features?.LoadingAPI?.ready()
  } catch {
    /* ignore */
  }

  gameplayInit()
}

export function isAppReady(): boolean {
  return readyCalled
}
