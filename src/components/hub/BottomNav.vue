<script setup lang="ts">
import collectionIcon from '@/assets/ui/nav/collection.jpg'
import homeIcon from '@/assets/ui/nav/home.jpg'
import shopIcon from '@/assets/ui/nav/shop.jpg'
import tasksIcon from '@/assets/ui/nav/tasks.jpg'
import type { HubScreen } from '@/game/types/game.types'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/playerStore'

defineProps<{
  active: HubScreen
}>()

const store = useGameStore()
const player = usePlayerStore()

const items: { id: HubScreen; icon: string; label: string }[] = [
  { id: 'shop', icon: shopIcon, label: 'Магазин' },
  { id: 'collection', icon: collectionIcon, label: 'Коллекция' },
  { id: 'home', icon: homeIcon, label: 'Домик' },
  { id: 'tasks', icon: tasksIcon, label: 'Задания' },
]

function navigate(screen: HubScreen): void {
  store.goToHub(screen)
}
</script>

<template>
  <nav class="bottom-nav hub-nav" aria-label="Разделы">
    <button
      v-for="item in items"
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
  flex-shrink: 0;
  width: var(--nav-icon-size);
  height: var(--nav-icon-size);
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
  width: var(--nav-icon-size);
  height: var(--nav-icon-size);
  border-radius: 5px;
  overflow: hidden;
  line-height: 0;
}

.hub-nav__icon {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  pointer-events: none;
  opacity: 0.75;
}

.hub-nav__item--active .hub-nav__icon {
  opacity: 1;
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
