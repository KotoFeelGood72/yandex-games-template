<script setup lang="ts">
import { ref } from 'vue'

import CustomScroll from '@/components/CustomScroll.vue'
import HubLayout from '@/components/hub/HubLayout.vue'
import coinIcon from '@/assets/ui/coin.png'
import payBtn from '@/assets/ui/pay.png'
import task1Icon from '@/assets/ui/task-1.png'
import task2Icon from '@/assets/ui/task-2.png'
import task3Icon from '@/assets/ui/task-3.png'
import task4Icon from '@/assets/ui/task-4.png'
import task5Icon from '@/assets/ui/task-5.png'
import task6Icon from '@/assets/ui/task-6.png'
import { dailyQuests } from '@/game/config/quests'
import { useGsapStaggerEnter } from '@/composables/useGsapEnter'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/playerStore'

const store = useGameStore()
const player = usePlayerStore()

const taskIcons = [task1Icon, task2Icon, task3Icon, task4Icon, task5Icon, task6Icon]

const emit = defineEmits<{ settings: [] }>()

const tasksRef = ref<HTMLElement | null>(null)
useGsapStaggerEnter(tasksRef, '.quest-card', { y: 16, stagger: 0.06, delay: 0.1 })

function claim(quest: (typeof dailyQuests)[number]): void {
  if (player.claimQuest(quest)) {
    store.showToast('Награда получена!')
  }
}

function onQuestCardClick(quest: (typeof dailyQuests)[number]): void {
  if (player.isQuestComplete(quest) && !player.isQuestClaimed(quest.id)) {
    claim(quest)
  }
}
</script>

<template>
  <HubLayout active="tasks" title="Задания" @settings="emit('settings')">
    <CustomScroll class="hub-list-scroll" height="100%" max-height="100%">
      <div ref="tasksRef" class="tasks">
      <div class="tasks__list">
        <article
          v-for="(quest, index) in dailyQuests"
          :key="quest.id"
          class="game-card quest-card"
          :class="{
            'quest-card--done': player.isQuestComplete(quest),
            'quest-card--claimed': player.isQuestClaimed(quest.id),
            'quest-card--claimable':
              player.isQuestComplete(quest) && !player.isQuestClaimed(quest.id),
          }"
          :role="
            player.isQuestComplete(quest) && !player.isQuestClaimed(quest.id) ? 'button' : undefined
          "
          :tabindex="
            player.isQuestComplete(quest) && !player.isQuestClaimed(quest.id) ? 0 : undefined
          "
          @click="onQuestCardClick(quest)"
          @keydown.enter.prevent="onQuestCardClick(quest)"
          @keydown.space.prevent="onQuestCardClick(quest)"
        >
          <img
            class="quest-card__icon"
            :src="taskIcons[index]"
            :alt="quest.title"
          />
          <div class="quest-card__body">
            <div class="quest-card__head">
              <h3 class="quest-card__title">{{ quest.title }}</h3>
              <div class="quest-card__reward-wrap">
                <span class="quest-card__reward-caption">Награда:</span>
                <span v-if="player.isQuestClaimed(quest.id)" class="quest-card__reward quest-card__reward--claimed">
                  <img class="quest-card__reward-bg" :src="payBtn" alt="" aria-hidden="true" />
                  <span class="quest-card__reward-label">✓ Получено</span>
                </span>
                <span v-else-if="quest.reward.coins" class="quest-card__reward">
                  <img class="quest-card__reward-bg" :src="payBtn" alt="" aria-hidden="true" />
                  <span class="quest-card__reward-label">
                    {{ quest.reward.coins }}
                    <img :src="coinIcon" alt="" aria-hidden="true" />
                  </span>
                </span>
                <span v-else-if="quest.reward.booster" class="quest-card__reward">
                  <img class="quest-card__reward-bg" :src="payBtn" alt="" aria-hidden="true" />
                  <span class="quest-card__reward-label">x{{ quest.reward.booster.amount }}</span>
                </span>
              </div>
            </div>
            <p class="quest-card__desc">{{ quest.description }}</p>
            <button
              v-if="player.isQuestComplete(quest) && !player.isQuestClaimed(quest.id)"
              type="button"
              class="quest-card__claim-link"
              @click.stop="claim(quest)"
            >
              Забрать
            </button>

            <span v-if="!player.isQuestClaimed(quest.id)" class="quest-card__nums">
              {{ Math.min(player.getQuestProgress(quest), quest.target) }} / {{ quest.target }}
            </span>
          </div>
        </article>
      </div>
      </div>
    </CustomScroll>
  </HubLayout>
</template>

<style scoped>
.tasks__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.quest-card {
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
}

.quest-card__icon {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  object-fit: contain;
  pointer-events: none;
}

.quest-card__body {
  flex: 1;
  min-width: 0;
}

.quest-card--done {
  border-color: #2a9e3a;
}

.quest-card--claimable {
  background: linear-gradient(180deg, #eefce8 0%, #dcf5d0 55%, #c8eeb8 100%);
  border-color: #2a9e3a;
  box-shadow:
    0 4px 14px rgba(42, 158, 58, 0.18),
    inset 0 2px 6px rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: filter 0.12s ease, transform 0.12s ease;
}

.quest-card--claimable:hover {
  filter: brightness(1.04);
}

.quest-card--claimable:active {
  transform: scale(0.99);
}

.quest-card--claimed {
  opacity: 0.72;
}

.quest-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.quest-card__title {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: var(--hub-text-accent);
  line-height: 1.2;
}

.quest-card__reward-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.quest-card__reward-caption {
  font-size: 11px;
  font-weight: 800;
  color: var(--hub-text-muted);
  white-space: nowrap;
}

.quest-card__reward {
  position: relative;
  flex-shrink: 0;
  width: 72px;
  height: 32px;
}

.quest-card__reward--claimed {
  width: 88px;
}

.quest-card__reward--claimed .quest-card__reward-label {
  font-size: 10px;
  letter-spacing: -0.02em;
}

.quest-card__reward-bg {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.quest-card__reward-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  pointer-events: none;
}

.quest-card__reward-label img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.quest-card__desc {
  margin: 0 0 4px;
  font-size: 12px;
  line-height: 1.35;
  color: var(--hub-text);
}

.quest-card__claim-link {
  align-self: flex-start;
  margin: 2px 0 0;
  padding: 0;
  border: none;
  background: transparent;
  font-family: var(--font-game);
  font-size: 12px;
  font-weight: 800;
  color: #2a9e3a;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.quest-card__claim-link:hover {
  color: #248532;
}

.quest-card__nums {
  display: block;
  font-size: 14px;
  font-weight: 800;
  color: tomato;
  text-align: right;
}
</style>
