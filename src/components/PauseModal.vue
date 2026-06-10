<script setup lang="ts">
import { ref, toRef } from 'vue'

import IconMusic from '~icons/mdi/music'
import IconMusicOff from '~icons/mdi/music-off'
import IconVolumeHigh from '~icons/mdi/volume-high'
import IconVolumeOff from '~icons/mdi/volume-off'

import continueBtn from '@/assets/ui/continiue.png'
import menuBtn from '@/assets/ui/menu.png'
import restartBtn from '@/assets/ui/restart.png'
import { useGsapModal } from '@/composables/useGsapModal'
import { useSettingsStore } from '@/stores/settingsStore'

const props = defineProps<{ show: boolean }>()

const settings = useSettingsStore()

const emit = defineEmits<{
  resume: []
  restart: []
  menu: []
}>()

const overlayRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

useGsapModal(toRef(props, 'show'), overlayRef, panelRef, {
  staggerSelector: '.pause-modal__btn, .pause-modal__toggle',
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      ref="overlayRef"
      class="pause-modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      <div ref="panelRef" class="pause-modal">
        <button
          v-gsap-press="0.94"
          type="button"
          class="pause-modal__close"
          aria-label="Закрыть"
          @click="emit('resume')"
        >
          ×
        </button>

        <header class="pause-modal__header">
          <h2 class="pause-modal__title">Пауза</h2>
        </header>

        <div class="pause-modal__actions">
          <button v-gsap-press type="button" class="pause-modal__btn" aria-label="Продолжить" @click="emit('resume')">
            <img :src="continueBtn" alt="Продолжить" />
          </button>
          <button v-gsap-press type="button" class="pause-modal__btn" aria-label="Рестарт" @click="emit('restart')">
            <img :src="restartBtn" alt="Рестарт" />
          </button>
          <button v-gsap-press type="button" class="pause-modal__btn" aria-label="Главное меню" @click="emit('menu')">
            <img :src="menuBtn" alt="Главное меню" />
          </button>
        </div>

        <div class="pause-modal__toggles">
          <button
            type="button"
            class="pause-modal__toggle pause-modal__toggle--sound"
            :class="{ 'pause-modal__toggle--off': !settings.soundEnabled }"
            :aria-pressed="settings.soundEnabled"
            @click="settings.toggleSound()"
          >
            <span class="pause-modal__toggle-icon" aria-hidden="true">
              <IconVolumeHigh v-if="settings.soundEnabled" />
              <IconVolumeOff v-else />
            </span>
            <span class="pause-modal__toggle-label">Звук</span>
          </button>
          <button
            type="button"
            class="pause-modal__toggle pause-modal__toggle--music"
            :class="{ 'pause-modal__toggle--off': !settings.musicEnabled }"
            :aria-pressed="settings.musicEnabled"
            @click="settings.toggleMusic()"
          >
            <span class="pause-modal__toggle-icon" aria-hidden="true">
              <IconMusic v-if="settings.musicEnabled" />
              <IconMusicOff v-else />
            </span>
            <span class="pause-modal__toggle-label">Музыка</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.pause-modal-overlay {
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

.pause-modal {
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

.pause-modal__close {
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

.pause-modal__close:active {
  transform: none;
}

.pause-modal__header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.pause-modal__title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #5c3a1e;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}

.pause-modal__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.pause-modal__btn {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: filter 0.12s ease;
}

.pause-modal__btn:hover {
  filter: brightness(1.04);
}

.pause-modal__btn img {
  display: block;
  width: 100%;
  height: 49px;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 3px 6px rgba(40, 24, 10, 0.28));
}

.pause-modal__toggles {
  display: flex;
  gap: 8px;
}

.pause-modal__toggle {
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

.pause-modal__toggle:active {
  filter: brightness(0.97);
}

.pause-modal__toggle--off {
  opacity: 0.72;
}

.pause-modal__toggle-icon {
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

.pause-modal__toggle--sound .pause-modal__toggle-icon {
  background: linear-gradient(180deg, #6b4220 0%, #5b3113 100%);
}

.pause-modal__toggle--music .pause-modal__toggle-icon {
  background: linear-gradient(180deg, #206818 0%, #18520e 100%);
}

.pause-modal__toggle-icon :deep(svg) {
  display: block;
  width: 22px;
  height: 22px;
}

.pause-modal__toggle-label {
  flex: 1;
  padding-right: 2px;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #40240d;
  text-align: left;
}
</style>
