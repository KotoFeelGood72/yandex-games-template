<script setup lang="ts">
import { computed } from 'vue'

import {
  DASH_COOLDOWN_MS,
  HIDE_COOLDOWN_MS,
  NEON_PER_SUSHI,
} from '@/game/data/matchConfig'
import { MAP_HEIGHT, MAP_WIDTH } from '@/game/data/mapConfig'
import { calcInventoryScore } from '@/game/domain/scoreCalc'
import { useMatchStore } from '@/stores/matchStore'

const matchStore = useMatchStore()
const baseUrl = import.meta.env.BASE_URL

const portraitUrl = `${baseUrl}team/yellow/down-0.png`

const playerScore = computed(() =>
  calcInventoryScore({
    neon: matchStore.playerNeon,
    sushi: matchStore.playerSushi,
    golden: matchStore.playerGolden,
  }),
)

const playerLevel = computed(() => {
  const total =
    matchStore.playerNeon + matchStore.playerSushi + matchStore.playerGolden
  return Math.floor(total / 3) + 1
})

const isExchanging = computed(() => matchStore.exchangeProgress > 0)

const hpFill = computed(() => {
  if (isExchanging.value) return matchStore.exchangeProgress * 100
  const neon = Math.min(matchStore.playerNeon, NEON_PER_SUSHI)
  return (neon / NEON_PER_SUSHI) * 100
})

const hpText = computed(() => {
  if (isExchanging.value) {
    return `${Math.round(matchStore.exchangeProgress * 100)}%`
  }
  const neon = Math.min(matchStore.playerNeon, NEON_PER_SUSHI)
  return `${neon} / ${NEON_PER_SUSHI}`
})

const mpFill = computed(() => {
  const dash = 1 - matchStore.dashCooldownLeft / DASH_COOLDOWN_MS
  const hide = 1 - matchStore.hideCooldownLeft / HIDE_COOLDOWN_MS
  return Math.max(0, Math.min(100, ((dash + hide) / 2) * 100))
})

const mpCurrent = computed(() => Math.round(mpFill.value))
const mpText = computed(() => `${mpCurrent.value} / 100`)

function cooldownPercent(leftMs: number, maxMs: number): number {
  if (leftMs <= 0) return 0
  return Math.min(100, (leftMs / maxMs) * 100)
}

function cooldownSeconds(leftMs: number): string {
  if (leftMs <= 0) return ''
  return (leftMs / 1000).toFixed(1)
}

function mapPos(x: number, y: number): { left: string; top: string } {
  return {
    left: `${50 + (x / MAP_WIDTH) * 100}%`,
    top: `${50 + (y / MAP_HEIGHT) * 100}%`,
  }
}

const playerMapPos = computed(() => mapPos(matchStore.playerX, matchStore.playerY))
const traderMapPos = computed(() => mapPos(matchStore.traderZoneX, matchStore.traderZoneY))
const goldenMapPos = computed(() => mapPos(matchStore.goldenX, matchStore.goldenY))

function togglePause(): void {
  matchStore.setPaused(!matchStore.paused)
}
</script>

<template>
  <div class="hud">
    <header class="hud__top">
      <div class="hud__team hud__team--blue">
        <span>Blue</span>
        <strong>{{ matchStore.blueScore }}</strong>
      </div>

      <div class="hud__timer">
        {{ matchStore.countdownActive ? '—' : matchStore.formattedTime }}
      </div>

      <div class="hud__team hud__team--pink">
        <span>Pink</span>
        <strong>{{ matchStore.pinkScore }}</strong>
      </div>
    </header>

    <div v-if="matchStore.traderActive" class="hud__alert hud__alert--trader">
      Торговец на карте
    </div>
    <div v-else-if="matchStore.goldenOnMap" class="hud__alert hud__alert--golden">
      ★ Golden Sushi
    </div>

    <footer class="hud-bar">
      <div class="hud-bar__strip">
        <div class="hud-bar__cluster hud-bar__cluster--map">
          <div class="moba-frame moba-frame--map">
            <div class="hud-bar__minimap">
              <div class="hud-bar__minimap-terrain" />
              <div class="hud-bar__minimap-river" />
              <div
                class="hud-bar__pin hud-bar__pin--blue"
                :style="mapPos(-1100, 0)"
              />
              <div
                class="hud-bar__pin hud-bar__pin--pink"
                :style="mapPos(1100, 0)"
              />
              <div
                v-if="matchStore.traderActive"
                class="hud-bar__pin hud-bar__pin--trader"
                :style="traderMapPos"
              />
              <div
                v-if="matchStore.goldenOnMap"
                class="hud-bar__pin hud-bar__pin--golden"
                :style="goldenMapPos"
              />
              <div class="hud-bar__pin hud-bar__pin--player" :style="playerMapPos" />
            </div>
          </div>
        </div>

        <div class="hud-bar__divider" />

        <div class="hud-bar__cluster hud-bar__cluster--hero">
          <div class="moba-frame moba-frame--portrait">
            <img class="hud-bar__portrait" :src="portraitUrl" alt="">
            <span class="hud-bar__level">{{ playerLevel }}</span>
          </div>

          <div class="hud-bar__vitals">
            <div class="vital-bar vital-bar--hp">
              <div class="vital-bar__fill" :style="{ width: `${hpFill}%` }" />
              <span class="vital-bar__text">{{ hpText }}</span>
            </div>
            <div class="vital-bar vital-bar--mp">
              <div class="vital-bar__fill" :style="{ width: `${mpFill}%` }" />
              <span class="vital-bar__text">{{ mpText }}</span>
            </div>
          </div>
        </div>

        <div class="hud-bar__divider" />

        <div class="hud-bar__cluster hud-bar__cluster--abilities">
          <div
            class="moba-slot moba-slot--ability"
            :class="{ 'moba-slot--cd': matchStore.dashCooldownLeft > 0 }"
          >
            <span class="moba-slot__key">Q</span>
            <div class="ability-icon ability-icon--dash" title="Рывок (Shift)" />
            <div
              v-if="matchStore.dashCooldownLeft > 0"
              class="moba-slot__cd"
              :style="{ height: `${cooldownPercent(matchStore.dashCooldownLeft, DASH_COOLDOWN_MS)}%` }"
            >
              <span>{{ cooldownSeconds(matchStore.dashCooldownLeft) }}</span>
            </div>
          </div>

          <div
            class="moba-slot moba-slot--ability"
            :class="{ 'moba-slot--cd': matchStore.hideCooldownLeft > 0 }"
          >
            <span class="moba-slot__key">W</span>
            <div class="ability-icon ability-icon--hide" title="Скрытие (H)" />
            <div
              v-if="matchStore.hideCooldownLeft > 0"
              class="moba-slot__cd"
              :style="{ height: `${cooldownPercent(matchStore.hideCooldownLeft, HIDE_COOLDOWN_MS)}%` }"
            >
              <span>{{ cooldownSeconds(matchStore.hideCooldownLeft) }}</span>
            </div>
          </div>

          <div
            class="moba-slot moba-slot--ability"
            :class="{ 'moba-slot--ready': matchStore.traderActive }"
          >
            <span class="moba-slot__key">E</span>
            <div class="ability-icon ability-icon--trade" title="Обмен (E)" />
          </div>

          <div class="moba-slot moba-slot--ability moba-slot--empty">
            <span class="moba-slot__key">R</span>
            <div class="ability-icon ability-icon--ult" title="Скоро" />
          </div>
        </div>

        <div class="hud-bar__divider" />

        <div class="hud-bar__cluster hud-bar__cluster--items">
          <div class="moba-slot moba-slot--item moba-slot--item-neon">
            <span class="moba-slot__key moba-slot__key--item">1</span>
            <img
              class="hud-bar__item-img hud-bar__item-img--neon"
              :src="`${baseUrl}neons/1.png`"
              alt=""
            >
            <span v-if="matchStore.playerNeon > 0" class="moba-slot__count">
              {{ matchStore.playerNeon }}
            </span>
          </div>

          <div class="moba-slot moba-slot--item moba-slot--item-sushi">
            <span class="moba-slot__key moba-slot__key--item">2</span>
            <img
              class="hud-bar__item-img hud-bar__item-img--sushi"
              :src="`${baseUrl}neons/2.png`"
              alt=""
            >
            <span v-if="matchStore.playerSushi > 0" class="moba-slot__count">
              {{ matchStore.playerSushi }}
            </span>
          </div>

          <div class="moba-slot moba-slot--item moba-slot--item-golden">
            <span class="moba-slot__key moba-slot__key--item">3</span>
            <div class="hud-bar__item-golden">★</div>
            <span v-if="matchStore.playerGolden > 0" class="moba-slot__count">
              {{ matchStore.playerGolden }}
            </span>
          </div>

          <div class="moba-slot moba-slot--item moba-slot--empty">
            <span class="moba-slot__key moba-slot__key--item">4</span>
          </div>
        </div>

        <div class="hud-bar__divider" />

        <div class="hud-bar__cluster hud-bar__cluster--meta">
          <div class="hud-bar__gold">
            <span class="hud-bar__gold-icon" aria-hidden="true" />
            <strong>{{ playerScore }}</strong>
          </div>
          <div class="hud-bar__tools">
            <button type="button" class="hud-bar__tool" title="Сброс">
              <span class="hud-bar__tool-icon hud-bar__tool-icon--trash" />
            </button>
            <button type="button" class="hud-bar__tool" title="Инвентарь">
              <span class="hud-bar__tool-icon hud-bar__tool-icon--bag" />
            </button>
            <button
              type="button"
              class="hud-bar__tool"
              title="Пауза"
              :disabled="matchStore.countdownActive"
              @click="togglePause"
            >
              <span class="hud-bar__tool-icon hud-bar__tool-icon--gear" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #eef4ff;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 12px;
}

.hud__top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 8px 16px 0;
}

.hud__team {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 88px;
  padding: 4px 10px;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.hud__team strong {
  font-size: 15px;
  letter-spacing: 0;
  text-transform: none;
}

.hud__team--blue strong {
  color: #6eb5ff;
}

.hud__team--pink strong {
  color: #ff6eb8;
}

.hud__timer {
  min-width: 72px;
  text-align: center;
  font-size: 22px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.hud__alert {
  align-self: center;
  padding: 4px 12px;
  border-radius: 3px;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.35);
}

.hud__alert--trader {
  border: 1px solid rgba(100, 220, 130, 0.3);
  color: #9effbb;
}

.hud__alert--golden {
  border: 1px solid rgba(255, 210, 80, 0.3);
  color: #ffd966;
}

/* ── Bottom strip (compact, centered) ── */

.hud-bar {
  pointer-events: none;
  display: flex;
  justify-content: center;
  padding: 0 10px 8px;
}

.hud-bar__strip {
  pointer-events: auto;
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
  flex-shrink: 0;
  gap: 0;
  width: fit-content;
  max-width: calc(100vw - 20px);
  min-height: var(--hud-bar-height, 118px);
  padding: 7px 12px 8px;
  background: linear-gradient(
    180deg,
    rgba(32, 32, 36, 0.48) 0%,
    rgba(16, 16, 20, 0.58) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 4px 20px rgba(0, 0, 0, 0.35);
}

.hud-bar__divider {
  width: 1px;
  align-self: stretch;
  margin: 6px 10px;
  background: rgba(255, 255, 255, 0.08);
}

.hud-bar__cluster {
  display: flex;
  align-items: center;
}

.hud-bar__cluster--map,
.hud-bar__cluster--hero {
  gap: 8px;
}

.hud-bar__cluster--abilities,
.hud-bar__cluster--items {
  gap: 3px;
}

.hud-bar__cluster--meta {
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 6px;
  min-width: 68px;
  padding-left: 2px;
}

/* Flat frames */

.moba-frame {
  position: relative;
  padding: 2px;
  background: rgba(0, 0, 0, 0.38);
  border: 1px solid rgba(150, 140, 130, 0.32);
  border-radius: 2px;
}

.moba-frame--map {
  width: 84px;
  height: 84px;
}

.moba-frame--portrait {
  width: 84px;
  height: 84px;
  flex-shrink: 0;
}

/* Minimap */

.hud-bar__minimap {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: rgba(12, 16, 14, 0.55);
}

.hud-bar__minimap-terrain {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 30% 40%, rgba(50, 70, 45, 0.35), transparent),
    radial-gradient(ellipse 70% 50% at 70% 60%, rgba(45, 65, 40, 0.3), transparent);
}

.hud-bar__minimap-river {
  position: absolute;
  left: -10%;
  top: 50%;
  width: 120%;
  height: 12px;
  transform: translateY(-50%) rotate(-28deg);
  background: linear-gradient(90deg, transparent, rgba(80, 140, 180, 0.35), transparent);
}

.hud-bar__pin {
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  z-index: 2;
}

.hud-bar__pin--blue {
  width: 6px;
  height: 6px;
  background: #4a90e8;
}

.hud-bar__pin--pink {
  width: 6px;
  height: 6px;
  background: #e84888;
}

.hud-bar__pin--trader {
  width: 5px;
  height: 5px;
  background: #50e878;
}

.hud-bar__pin--golden {
  width: 5px;
  height: 5px;
  background: #ffd040;
}

.hud-bar__pin--player {
  width: 7px;
  height: 7px;
  background: #ffe880;
  border: 1.5px solid #fff;
  z-index: 3;
}

/* Portrait */

.hud-bar__portrait {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  background: rgba(0, 0, 0, 0.4);
  image-rendering: pixelated;
}

.hud-bar__level {
  position: absolute;
  right: -3px;
  bottom: -3px;
  min-width: 22px;
  height: 22px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 800;
  color: #2a2010;
  background: #d4a830;
  border: 2px solid #3a3018;
  z-index: 2;
}

/* Vital bars */

.hud-bar__vitals {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-width: 156px;
  max-width: 200px;
}

.vital-bar {
  position: relative;
  height: 18px;
  border-radius: 1px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.vital-bar__fill {
  position: absolute;
  inset: 0 auto 0 0;
  transition: width 0.12s linear;
}

.vital-bar--hp .vital-bar__fill {
  background: #44bd32;
}

.vital-bar--mp .vital-bar__fill {
  background: #0097e6;
}

.vital-bar__text {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
}

/* Slots */

.moba-slot {
  position: relative;
  width: 52px;
  height: 52px;
  padding: 2px;
  background: rgba(0, 0, 0, 0.42);
  border: 1px solid rgba(170, 150, 155, 0.32);
  border-radius: 2px;
  overflow: hidden;
}

.moba-slot--ability {
  border-color: rgba(200, 120, 160, 0.38);
}

.moba-slot--item-neon {
  border-color: rgba(220, 190, 60, 0.45);
}

.moba-slot--item-sushi {
  border-color: rgba(160, 100, 220, 0.45);
}

.moba-slot--item-golden {
  border-color: rgba(220, 190, 60, 0.45);
}

.moba-slot--empty {
  opacity: 0.5;
}

.moba-slot--ready {
  border-color: rgba(80, 220, 120, 0.55);
}

.moba-slot__key {
  position: absolute;
  top: 2px;
  left: 3px;
  z-index: 3;
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1;
}

.moba-slot__key--item {
  top: auto;
  bottom: 2px;
}

.moba-slot__count {
  position: absolute;
  right: 4px;
  bottom: 2px;
  z-index: 3;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
}

.moba-slot__cd {
  position: absolute;
  left: 2px;
  right: 2px;
  bottom: 2px;
  z-index: 4;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 3px;
  background: rgba(0, 0, 0, 0.65);
  pointer-events: none;
}

.moba-slot__cd span {
  font-size: 12px;
  font-weight: 800;
  color: #fff;
}

/* Ability icons — neon pink, flat bg */

.ability-icon {
  width: 100%;
  height: 100%;
  background: rgba(8, 8, 12, 0.55);
}

.ability-icon--dash {
  background:
    linear-gradient(135deg, transparent 42%, #ff44cc 42%, #ff44cc 46%, transparent 46%),
    linear-gradient(135deg, transparent 48%, #ff66dd 48%, #ff66dd 52%, transparent 52%),
    linear-gradient(135deg, transparent 54%, #ff44cc 54%, #ff44cc 58%, transparent 58%),
    rgba(8, 8, 12, 0.55);
  filter: drop-shadow(0 0 3px rgba(255, 68, 204, 0.65));
}

.ability-icon--hide {
  background:
    radial-gradient(circle at 50% 50%, #ff44cc 0%, #ff44cc 28%, transparent 30%),
    rgba(8, 8, 12, 0.55);
  filter: drop-shadow(0 0 3px rgba(255, 68, 204, 0.6));
}

.ability-icon--trade {
  background:
    radial-gradient(circle at 50% 50%, transparent 55%, #ff44cc 56%, #ff44cc 62%, transparent 63%),
    rgba(8, 8, 12, 0.55);
  filter: drop-shadow(0 0 3px rgba(255, 68, 204, 0.6));
}

.ability-icon--ult {
  background:
    linear-gradient(0deg, transparent 35%, rgba(255, 68, 204, 0.35) 35%, rgba(255, 68, 204, 0.35) 40%, transparent 40%),
    linear-gradient(0deg, transparent 48%, rgba(255, 102, 221, 0.3) 48%, rgba(255, 102, 221, 0.3) 53%, transparent 53%),
    linear-gradient(0deg, transparent 61%, rgba(255, 68, 204, 0.35) 61%, rgba(255, 68, 204, 0.35) 66%, transparent 66%),
    rgba(8, 8, 12, 0.55);
}

/* Items */

.hud-bar__item-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
  background: rgba(8, 8, 12, 0.45);
  image-rendering: pixelated;
}

.hud-bar__item-img--neon {
  filter: drop-shadow(0 0 5px rgba(0, 200, 255, 0.75));
}

.hud-bar__item-img--sushi {
  filter: drop-shadow(0 0 5px rgba(140, 80, 255, 0.7));
}

.hud-bar__item-golden {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba(8, 8, 12, 0.45);
  font-size: 22px;
  color: #ffd040;
  filter: drop-shadow(0 0 5px rgba(255, 208, 64, 0.65));
}

/* Meta */

.hud-bar__gold {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 800;
  color: #fff;
}

.hud-bar__gold-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #d4a020;
  border: 1px solid #806010;
}

.hud-bar__tools {
  display: flex;
  gap: 3px;
}

.hud-bar__tool {
  width: 30px;
  height: 30px;
  padding: 0;
  cursor: pointer;
  border: none;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.42);
  border: 1px solid rgba(140, 140, 150, 0.28);
}

.hud-bar__tool:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.hud-bar__tool-icon {
  display: block;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 15px 15px;
  opacity: 0.75;
}

.hud-bar__tool-icon--trash {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2'%3E%3Cpath d='M4 7h16M9 7V5h6v2M7 7l1 12h8l1-12'/%3E%3C/svg%3E");
}

.hud-bar__tool-icon--bag {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2'%3E%3Cpath d='M6 8h12l-1 12H7L6 8z'/%3E%3Cpath d='M9 8V6a3 3 0 016 0v2'/%3E%3C/svg%3E");
}

.hud-bar__tool-icon--gear {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3Cpath d='M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'/%3E%3C/svg%3E");
}

@media (max-width: 960px) {
  .hud-bar__strip {
    overflow-x: auto;
    scrollbar-width: none;
  }

  .hud-bar__strip::-webkit-scrollbar {
    display: none;
  }

  .hud-bar__vitals {
    min-width: 110px;
  }

  .moba-frame--map,
  .moba-frame--portrait {
    width: 68px;
    height: 68px;
  }

  .moba-slot {
    width: 44px;
    height: 44px;
  }
}

@media (max-width: 640px) {
  .hud__top {
    gap: 10px;
  }

  .hud__team {
    min-width: 0;
    padding: 3px 8px;
  }

  .hud__timer {
    font-size: 18px;
  }

  .hud-bar__vitals {
    display: none;
  }

  .hud-bar__cluster--hero {
    gap: 0;
  }
}
</style>
