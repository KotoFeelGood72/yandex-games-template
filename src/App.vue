<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'

import LoadingScreen from '@/components/LoadingScreen.vue'
import { runAppBoot } from '@/composables/useAppBoot'
import { unlockAudioOnGesture } from '@/audio/sounds'

const bootDone = ref(false)
const loadingRef = ref<InstanceType<typeof LoadingScreen> | null>(null)

onMounted(async () => {
  unlockAudioOnGesture()
  await nextTick()
  await loadingRef.value?.waitUntilReady()

  await runAppBoot((progress) => {
    loadingRef.value?.setProgress(progress)
  })

  await loadingRef.value?.finish()
  bootDone.value = true
})
</script>

<template>
  <LoadingScreen v-if="!bootDone" ref="loadingRef" />
  <RouterView v-else />
</template>

<style>
html, body {
  background-color: var(--color-wall-deep);
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  touch-action: manipulation;
  overscroll-behavior: none;
}
#app {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}
* {
  box-sizing: border-box;
}
</style>
