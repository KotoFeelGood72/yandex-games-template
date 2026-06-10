<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

import { animateToastIn, animateToastOut } from '@/shared/animations/gsapPresets'
import { useGameStore } from '@/stores/game'

const store = useGameStore()
const toastRef = ref<HTMLElement | null>(null)
const visible = ref(false)
let hideTimer: number | null = null

watch(
  () => store.toastMessage,
  async (message) => {
    if (hideTimer !== null) {
      window.clearTimeout(hideTimer)
      hideTimer = null
    }

    if (!message) {
      if (toastRef.value && visible.value) {
        await animateToastOut(toastRef.value)
      }
      visible.value = false
      return
    }

    visible.value = true
    await nextTick()
    if (toastRef.value) {
      animateToastIn(toastRef.value)
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" ref="toastRef" class="game-toast">
      {{ store.toastMessage }}
    </div>
  </Teleport>
</template>
