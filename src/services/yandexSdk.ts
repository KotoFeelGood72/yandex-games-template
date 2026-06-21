import { initYandex, getYsdk } from '@/yandex/sdk'

export async function initYandexSdk() {
  const existing = getYsdk()
  if (existing) return existing
  return initYandex()
}

export { getYsdk }
