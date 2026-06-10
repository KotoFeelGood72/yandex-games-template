import { defineStore } from 'pinia'
import { ref } from 'vue'

import { setMusicEnabled, setSfxEnabled } from '@/audio/sounds'
import { loadJson, saveJson } from '@/shared/utils/localStorage'

const STORAGE_KEY = 'cat-merge-settings'

interface SettingsState {
  soundEnabled: boolean
  musicEnabled: boolean
  vibrationEnabled: boolean
}

const defaults: SettingsState = {
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
}

export const useSettingsStore = defineStore('settings', () => {
  const saved = loadJson<SettingsState>(STORAGE_KEY, defaults)

  const soundEnabled = ref(saved.soundEnabled)
  const musicEnabled = ref(saved.musicEnabled)
  const vibrationEnabled = ref(saved.vibrationEnabled)

  setSfxEnabled(soundEnabled.value)
  setMusicEnabled(musicEnabled.value)

  function persist(): void {
    saveJson(STORAGE_KEY, {
      soundEnabled: soundEnabled.value,
      musicEnabled: musicEnabled.value,
      vibrationEnabled: vibrationEnabled.value,
    })
  }

  function toggleSound(): void {
    soundEnabled.value = !soundEnabled.value
    setSfxEnabled(soundEnabled.value)
    persist()
  }

  function toggleMusic(): void {
    musicEnabled.value = !musicEnabled.value
    setMusicEnabled(musicEnabled.value)
    persist()
  }

  function toggleVibration(): void {
    vibrationEnabled.value = !vibrationEnabled.value
    persist()
  }

  function resetProgress(): void {
    localStorage.removeItem('cat-merge-player')
    localStorage.removeItem('cat-merge-settings')
    soundEnabled.value = defaults.soundEnabled
    musicEnabled.value = defaults.musicEnabled
    vibrationEnabled.value = defaults.vibrationEnabled
    setSfxEnabled(soundEnabled.value)
    setMusicEnabled(musicEnabled.value)
  }

  return {
    soundEnabled,
    musicEnabled,
    vibrationEnabled,
    toggleSound,
    toggleMusic,
    toggleVibration,
    resetProgress,
  }
})
