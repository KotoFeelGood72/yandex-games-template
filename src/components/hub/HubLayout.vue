<script setup lang="ts">
import { ref } from 'vue'

import type { HubScreen } from '@/game/types/game.types'

import { useGsapHubShell } from '@/composables/useGsapEnter'

import BottomNav from './BottomNav.vue'
import HubHeader from './HubHeader.vue'

defineProps<{
  active: HubScreen
  title?: string
  fill?: boolean
}>()

const emit = defineEmits<{ settings: [] }>()

const layoutRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const navRef = ref<HTMLElement | null>(null)

useGsapHubShell(layoutRef, headerRef, contentRef, navRef)
</script>

<template>
  <div ref="layoutRef" class="hub-layout scene-bg">
    <div class="hub-layout__column scene-column">
      <div ref="headerRef">
        <HubHeader :title="title" @settings="emit('settings')" />
      </div>

      <main
        ref="contentRef"
        class="hub-layout__content"
        :class="{ 'hub-layout__content--fill': fill }"
      >
        <slot />
      </main>

      <div ref="navRef">
        <BottomNav :active="active" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.hub-layout {
  display: flex;
  justify-content: center;
  min-height: 100dvh;
}

.hub-layout__column {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  max-height: 100dvh;
  min-height: 0;
  overflow: hidden;
}

.hub-layout__content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  padding-bottom: 8px;
}

.hub-layout__content--fill {
  height: 100%;
  padding-bottom: 0;
}
</style>
