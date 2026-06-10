<script setup lang="ts">
import { ref, toRef, watch } from 'vue'

import okeyBtn from '@/assets/ui/okey.png'
import { useGsapModal } from '@/composables/useGsapModal'
import { animateContentSwap } from '@/shared/animations/gsapPresets'
import { useGameStore } from '@/stores/game'

const props = defineProps<{ show: boolean }>()

const store = useGameStore()
const step = ref(0)
const contentRef = ref<HTMLElement | null>(null)

const overlayRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

useGsapModal(toRef(props, 'show'), overlayRef, panelRef, {
  staggerSelector: '.tutorial-step, .tutorial-title, .tutorial-text, .game-modal__actions > *',
})

watch(step, async () => {
  if (!contentRef.value) return
  animateContentSwap(contentRef.value)
})

const steps = [
  { title: 'Двигай объект', text: 'Двигай объект влево и вправо в верхней части поля.' },
  { title: 'Сбрасывай', text: 'Отпусти палец или мышь, чтобы объект упал вниз.' },
  { title: 'Соединяй', text: 'Соединяй одинаковые объекты — молоко, корм, рыбки, клубки, котят.' },
  { title: 'Не переполняй', text: 'Не дай объектам подняться выше красной линии слишком долго.' },
  { title: 'Коллекция', text: 'Открывай новых котиков в коллекции и получай награды!' },
]

function next(): void {
  if (step.value < steps.length - 1) {
    step.value++
  } else {
    step.value = 0
    store.finishTutorial()
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      ref="overlayRef"
      class="game-modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      <div ref="panelRef" class="game-modal game-modal--tutorial">
        <h2 class="game-modal__title">Как играть</h2>
        <div ref="contentRef">
          <p class="tutorial-step">Шаг {{ step + 1 }} / {{ steps.length }}</p>
          <h3 class="tutorial-title">{{ steps[step]!.title }}</h3>
          <p class="tutorial-text">{{ steps[step]!.text }}</p>
        </div>

        <div class="game-modal__actions">
          <button
            v-if="step < steps.length - 1"
            v-gsap-press
            type="button"
            class="game-btn game-btn--green"
            @click="next"
          >
            Далее
          </button>
          <button v-else v-gsap-press type="button" class="game-modal__btn" aria-label="Понятно" @click="next">
            <img :src="okeyBtn" alt="Понятно" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.tutorial-step {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 800;
  color: var(--hub-text-muted);
}

.tutorial-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 800;
  color: var(--hub-text-accent);
}

.tutorial-text {
  margin: 0 0 20px;
  font-size: 15px;
  line-height: 1.45;
  color: var(--hub-text);
}
</style>
