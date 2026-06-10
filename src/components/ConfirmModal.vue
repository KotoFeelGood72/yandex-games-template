<script setup lang="ts">
import { ref, toRef } from 'vue'

import { useGsapModal } from '@/composables/useGsapModal'

const props = withDefaults(
  defineProps<{
    show: boolean
    message: string
    title?: string
    confirmLabel?: string
    cancelLabel?: string
    danger?: boolean
  }>(),
  {
    title: 'Подтвердите действие',
    confirmLabel: 'Да',
    cancelLabel: 'Отмена',
    danger: false,
  },
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const overlayRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

useGsapModal(toRef(props, 'show'), overlayRef, panelRef, {
  staggerSelector: '.confirm-modal__message, .confirm-modal__actions > *',
})

function onCancel(): void {
  emit('cancel')
}

function onConfirm(): void {
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      ref="overlayRef"
      class="confirm-modal-overlay"
      role="alertdialog"
      aria-modal="true"
      :aria-labelledby="show ? 'confirm-modal-title' : undefined"
      :aria-describedby="show ? 'confirm-modal-message' : undefined"
      @click.self="onCancel"
    >
      <div ref="panelRef" class="confirm-modal">
        <h2 id="confirm-modal-title" class="confirm-modal__title">{{ title }}</h2>
        <p id="confirm-modal-message" class="confirm-modal__message">{{ message }}</p>

        <div class="confirm-modal__actions">
          <button
            v-gsap-press
            type="button"
            class="confirm-modal__btn confirm-modal__btn--cancel"
            @click="onCancel"
          >
            {{ cancelLabel }}
          </button>
          <button
            v-gsap-press
            type="button"
            class="confirm-modal__btn"
            :class="danger ? 'confirm-modal__btn--danger' : 'confirm-modal__btn--confirm'"
            @click="onConfirm"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(20, 12, 8, 0.62);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.confirm-modal {
  width: min(100%, 340px);
  padding: 24px 22px 20px;
  border-radius: 24px;
  background: linear-gradient(180deg, #fff9ef 0%, #f5e6c8 55%, #edd9b0 100%);
  border: 4px solid #c49a6c;
  box-shadow:
    0 16px 48px rgba(40, 24, 10, 0.45),
    inset 0 2px 6px rgba(255, 255, 255, 0.85);
}

.confirm-modal__title {
  margin: 0 0 12px;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  text-align: center;
  color: #5c3a1e;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}

.confirm-modal__message {
  margin: 0 0 18px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.45;
  text-align: center;
  color: #40240d;
}

.confirm-modal__actions {
  display: flex;
  gap: 10px;
}

.confirm-modal__btn {
  flex: 1;
  min-height: 44px;
  padding: 0 12px;
  border: none;
  border-radius: 12px;
  font-family: var(--font-game);
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: filter 0.12s ease;
}

.confirm-modal__btn--cancel {
  background: linear-gradient(180deg, #e8cc9b 0%, #d4a574 100%);
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.45),
    inset 0 -2px 0 rgba(120, 80, 40, 0.2),
    0 3px 8px rgba(60, 36, 16, 0.2);
  color: #40240d;
}

.confirm-modal__btn--confirm {
  background: linear-gradient(180deg, #6ecf7a 0%, #4cd964 55%, #38b84a 100%);
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.35),
    inset 0 -2px 0 rgba(20, 100, 30, 0.25),
    0 3px 8px rgba(40, 140, 50, 0.35);
  color: #fff;
}

.confirm-modal__btn--danger {
  background: linear-gradient(180deg, #ff9a5a 0%, #e86a28 55%, #d45518 100%);
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.35),
    inset 0 -2px 0 rgba(120, 40, 10, 0.25),
    0 3px 8px rgba(180, 60, 20, 0.35);
  color: #fff;
}

.confirm-modal__btn:hover {
  filter: brightness(1.04);
}
</style>
