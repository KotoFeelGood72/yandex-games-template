<script setup lang="ts">
import { ref, toRef } from 'vue'

import IconMusic from '~icons/mdi/music'
import IconMusicOff from '~icons/mdi/music-off'
import IconVolumeHigh from '~icons/mdi/volume-high'
import IconVolumeOff from '~icons/mdi/volume-off'

import ConfirmModal from '@/components/ConfirmModal.vue'
import { useGsapModal } from '@/composables/useGsapModal'
import { usePlayerStore } from '@/stores/playerStore'
import { useSettingsStore } from '@/stores/settingsStore'

const props = defineProps<{ show: boolean }>()

const settings = useSettingsStore()
const player = usePlayerStore()

const emit = defineEmits<{ close: [] }>()

const overlayRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const showResetConfirm = ref(false)

useGsapModal(toRef(props, 'show'), overlayRef, panelRef, {
  staggerSelector: '.settings-modal__toggle, .settings-modal__reset',
})

function requestReset(): void {
  showResetConfirm.value = true
}

function confirmReset(): void {
  showResetConfirm.value = false
  settings.resetProgress()
  player.loadProgress()
  emit('close')
}

function cancelReset(): void {
  showResetConfirm.value = false
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      ref="overlayRef"
      class="settings-modal-overlay"
      role="dialog"
      aria-modal="true"
      @click.self="emit('close')"
    >
      <div ref="panelRef" class="settings-modal">
        <button
          v-gsap-press="0.94"
          type="button"
          class="settings-modal__close"
          aria-label="Закрыть"
          @click="emit('close')"
        >
          ×
        </button>

        <header class="settings-modal__header">
          <h2 class="settings-modal__title">Настройки</h2>
        </header>

        <div class="settings-modal__toggles">
          <button
            type="button"
            class="settings-modal__toggle settings-modal__toggle--sound"
            :class="{ 'settings-modal__toggle--off': !settings.soundEnabled }"
            :aria-pressed="settings.soundEnabled"
            @click="settings.toggleSound()"
          >
            <span class="settings-modal__toggle-icon" aria-hidden="true">
              <IconVolumeHigh v-if="settings.soundEnabled" />
              <IconVolumeOff v-else />
            </span>
            <span class="settings-modal__toggle-label">Звук</span>
          </button>
          <button
            type="button"
            class="settings-modal__toggle settings-modal__toggle--music"
            :class="{ 'settings-modal__toggle--off': !settings.musicEnabled }"
            :aria-pressed="settings.musicEnabled"
            @click="settings.toggleMusic()"
          >
            <span class="settings-modal__toggle-icon" aria-hidden="true">
              <IconMusic v-if="settings.musicEnabled" />
              <IconMusicOff v-else />
            </span>
            <span class="settings-modal__toggle-label">Музыка</span>
          </button>
        </div>

        <div class="settings-modal__actions">
          <button v-gsap-press type="button" class="settings-modal__reset" @click="requestReset">
            Сбросить прогресс
          </button>
        </div>
      </div>
    </div>

    <ConfirmModal
      :show="showResetConfirm"
      message="Сбросить весь прогресс? Это действие нельзя отменить."
      confirm-label="Сбросить"
      cancel-label="Отмена"
      danger
      @confirm="confirmReset"
      @cancel="cancelReset"
    />
  </Teleport>
</template>

<style scoped>
.settings-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(20, 12, 8, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.settings-modal {
  position: relative;
  width: min(100%, 340px);
  padding: 28px 32px 26px;
  border-radius: 28px;
  background: linear-gradient(180deg, #fff9ef 0%, #f5e6c8 55%, #edd9b0 100%);
  border: 4px solid #c49a6c;
  box-shadow:
    0 16px 48px rgba(40, 24, 10, 0.45),
    inset 0 2px 6px rgba(255, 255, 255, 0.85);
}

.settings-modal__close {
  position: absolute;
  top: -10px;
  right: -6px;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 3px solid #c49a6c;
  border-radius: 50%;
  background: linear-gradient(180deg, #f5e0b8 0%, #d4a574 100%);
  box-shadow:
    0 3px 8px rgba(60, 36, 16, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  color: #5c3a1e;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: filter 0.12s ease;
}

.settings-modal__close:active {
  transform: none;
}

.settings-modal__header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.settings-modal__title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #5c3a1e;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}

.settings-modal__toggles {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.settings-modal__toggle {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 42px;
  padding: 3px 10px 3px 3px;
  border: none;
  border-radius: 10px;
  background: #e8cc9b;
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.45),
    inset 0 -2px 3px rgba(120, 80, 40, 0.18);
  cursor: pointer;
  user-select: none;
  transition: filter 0.12s ease, opacity 0.12s ease;
}

.settings-modal__toggle:active {
  filter: brightness(0.97);
}

.settings-modal__toggle--off {
  opacity: 0.72;
}

.settings-modal__toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: #fff;
  font-size: 20px;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.28),
    inset 0 -2px 0 rgba(0, 0, 0, 0.22),
    0 2px 4px rgba(40, 24, 10, 0.25);
}

.settings-modal__toggle--sound .settings-modal__toggle-icon {
  background: linear-gradient(180deg, #6b4220 0%, #5b3113 100%);
}

.settings-modal__toggle--music .settings-modal__toggle-icon {
  background: linear-gradient(180deg, #206818 0%, #18520e 100%);
}

.settings-modal__toggle-icon :deep(svg) {
  display: block;
  width: 22px;
  height: 22px;
}

.settings-modal__toggle-label {
  flex: 1;
  padding-right: 2px;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #40240d;
  text-align: left;
}

.settings-modal__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settings-modal__reset {
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, #ff9a5a 0%, #e86a28 55%, #d45518 100%);
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.35),
    inset 0 -2px 0 rgba(120, 40, 10, 0.25),
    0 3px 8px rgba(180, 60, 20, 0.35);
  color: #fff;
  font-family: var(--font-game);
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: filter 0.12s ease;
}

.settings-modal__reset:hover {
  filter: brightness(1.04);
}
</style>
