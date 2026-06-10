<script setup lang="ts">
import { ref } from 'vue'

import CustomScroll from '@/components/CustomScroll.vue'
import HubLayout from '@/components/hub/HubLayout.vue'
import circleFrame from '@/assets/circle.png'
import { getCatSpriteUrl } from '@/game/assets/catSprites'
import { catCatalog, MAX_CATALOG_LEVEL, rarityLabels } from '@/game/config/cats'
import { useGsapStaggerEnter } from '@/composables/useGsapEnter'
import { usePlayerStore } from '@/stores/playerStore'

const player = usePlayerStore()

const emit = defineEmits<{ settings: [] }>()

const collectionRef = ref<HTMLElement | null>(null)
useGsapStaggerEnter(collectionRef, '.cat-card', { y: 18, stagger: 0.04, delay: 0.1 })

function isUnlocked(level: number): boolean {
  return level <= player.progress.maxUnlockedLevel
}
</script>

<template>
  <HubLayout active="collection" title="Коллекция" @settings="emit('settings')">
    <CustomScroll class="hub-list-scroll" height="100%" max-height="100%">
      <div ref="collectionRef" class="collection">
      <div class="collection__progress wood-plaque">
        <span class="collection__progress-value">
          {{ player.progress.maxUnlockedLevel }}/{{ MAX_CATALOG_LEVEL }}
        </span>
      </div>

      <div class="collection__grid">
        <article
          v-for="cat in catCatalog"
          :key="cat.level"
          class="game-card cat-card"
          :class="{ 'cat-card--locked': !isUnlocked(cat.level) }"
        >
          <span v-if="isUnlocked(cat.level)" class="rarity-chip">{{ rarityLabels[cat.rarity] }}</span>
          <div class="cat-preview" :class="{ 'cat-preview--locked': !isUnlocked(cat.level) }">
            <img class="cat-preview__circle" :src="circleFrame" alt="" aria-hidden="true" />
            <img
              v-if="isUnlocked(cat.level)"
              class="cat-preview__sprite"
              :src="getCatSpriteUrl(cat.level)"
              :alt="cat.name"
            />
            <span v-else class="cat-preview__lock">?</span>
          </div>
          <div class="cat-card__info">
            <span class="cat-card__name">{{ isUnlocked(cat.level) ? cat.name : '???' }}</span>
          </div>
        </article>
      </div>
      </div>
    </CustomScroll>
  </HubLayout>
</template>

<style scoped>
.collection__progress {
  display: flex;
  justify-content: flex-end;
  margin: 0 0 12px;
  padding: 8px 14px;
  width: fit-content;
  margin-left: auto;
}

.collection__progress-value {
  font-size: 14px;
  font-weight: 800;
  color: tomato;
  font-variant-numeric: tabular-nums;
}

.collection__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.cat-card {
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 10px 14px;
  min-width: 0;
}

.cat-card--locked {
  opacity: 0.78;
}

.cat-card__info {
  width: 100%;
  text-align: center;
}

.cat-card__name {
  display: block;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.25;
  color: var(--hub-text-accent);
}

.cat-card .cat-preview {
  width: 96px;
  height: 96px;
}
</style>
