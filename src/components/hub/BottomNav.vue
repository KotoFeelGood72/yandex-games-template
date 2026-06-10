<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

import collectionIcon from '@/assets/ui/collection.png'
import homeIcon from '@/assets/ui/home.png'
import shopIcon from '@/assets/ui/shop.png'
import tasksIcon from '@/assets/ui/tasks.png'
import type { HubScreen } from '@/game/types/game.types'
import { applyHubNavActiveState } from '@/shared/animations/gsapPresets'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/playerStore'

const props = defineProps<{
  active: HubScreen
}>()

const store = useGameStore()
const player = usePlayerStore()

const navRef = ref<HTMLElement | null>(null)
const glowRefs = ref<(HTMLElement | null)[]>([])

const items: { id: HubScreen; icon: string; label: string }[] = [
  { id: 'shop', icon: shopIcon, label: 'Магазин' },
  { id: 'collection', icon: collectionIcon, label: 'Коллекция' },
  { id: 'home', icon: homeIcon, label: 'Домик' },
  { id: 'tasks', icon: tasksIcon, label: 'Задания' },
]

function activeIndex(): number {
  return items.findIndex((item) => item.id === props.active)
}

function syncActiveVisuals(): void {
  const nav = navRef.value
  if (!nav) return

  const buttons = Array.from(nav.querySelectorAll<HTMLElement>('.hub-nav__item'))
  const glows = glowRefs.value.filter(Boolean) as HTMLElement[]
  applyHubNavActiveState(buttons, glows, activeIndex())
}

function navigate(screen: HubScreen): void {
  store.goToHub(screen)
}

watch(
  () => props.active,
  async () => {
    await nextTick()
    syncActiveVisuals()
  },
)

onMounted(async () => {
  await nextTick()
  syncActiveVisuals()
})
</script>

<template>
  <nav ref="navRef" class="bottom-nav hub-nav" aria-label="Разделы">
    <button
      v-for="(item, index) in items"
      :key="item.id"
      v-gsap-press="0.96"
      type="button"
      class="bottom-nav__item hub-nav__item"
      :class="{ 'hub-nav__item--active': active === item.id }"
      :aria-label="item.label"
      :aria-current="active === item.id ? 'page' : undefined"
      @click="navigate(item.id)"
    >
      <span class="hub-nav__icon-wrap">
        <span
          :ref="(el) => (glowRefs[index] = el as HTMLElement | null)"
          class="hub-nav__glow"
          aria-hidden="true"
        />
        <img class="hub-nav__icon" :src="item.icon" :alt="item.label" />
      </span>
      <span v-if="item.id === 'tasks' && player.pendingQuestsCount() > 0" class="hub-nav__badge">
        {{ player.pendingQuestsCount() }}
      </span>
    </button>
  </nav>
</template>

<style scoped>
.hub-nav {
  position: sticky;
  bottom: 0;
  width: 100%;
  padding: 8px 0 max(6px, var(--app-safe-bottom));
}

.hub-nav__item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.hub-nav__item:active {
  transform: none;
}

.hub-nav__icon-wrap {
  position: relative;
  display: block;
  line-height: 0;
}

.hub-nav__glow {
  position: absolute;
  left: 50%;
  bottom: -2px;
  z-index: 0;
  width: calc(var(--nav-icon-width) + 18px);
  height: calc(var(--nav-icon-height) * 0.72);
  border-radius: 999px;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 228, 120, 0.95) 0%,
    rgba(255, 196, 64, 0.42) 42%,
    rgba(255, 196, 64, 0) 72%
  );
  opacity: 0;
  pointer-events: none;
  transform: translateX(-50%) scale(0.72);
  filter: blur(1px);
}

.hub-nav__icon {
  position: relative;
  z-index: 1;
  width: var(--nav-icon-width);
  height: var(--nav-icon-height);
  object-fit: contain;
  display: block;
  pointer-events: none;
  transform-origin: center bottom;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35)) brightness(0.82) saturate(0.78);
  opacity: 0.72;
}

.hub-nav__item--active .hub-nav__icon {
  filter: drop-shadow(0 0 10px rgba(255, 220, 110, 0.95))
    drop-shadow(0 0 18px rgba(255, 180, 40, 0.45)) drop-shadow(0 5px 12px rgba(0, 0, 0, 0.42))
    brightness(1.06) saturate(1.08);
  opacity: 1;
}

.hub-nav__item--active .hub-nav__glow {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}

.hub-nav__badge {
  position: absolute;
  top: -5px;
  right: -5px;
  z-index: 2;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: 19px;
  background: linear-gradient(180deg, #ff6b6b, #e53935);
  border: 2px solid rgba(255, 255, 255, 0.85);
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(198, 40, 40, 0.45);
}
</style>
