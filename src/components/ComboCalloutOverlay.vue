<script setup lang="ts">
import gsap from 'gsap'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import { COMBO_CALLOUT_Y_RATIO } from '@/game/config/comboCallouts'
import { getComboCalloutStyle } from '@/game/config/comboCalloutStyles'
import { GAME_HEIGHT, GAME_WIDTH, LOSE_LINE_Y } from '@/game/config/gameConfig'
import type { ComboCallout } from '@/game/types/game.types'
import { animateComboCallout } from '@/shared/animations/gsapPresets'

const props = defineProps<{
  callout: ComboCallout | null
  displayWidth: number
  displayHeight: number
}>()

const motionRef = ref<HTMLElement | null>(null)
const shown = ref<ComboCallout | null>(null)

let timeline: gsap.core.Timeline | null = null

const comboChars = computed(() => {
  if (!shown.value) return [] as string[]
  return [...shown.value.text]
})

const anchorStyle = computed(() => {
  if (props.displayWidth <= 0 || props.displayHeight <= 0) {
    return { top: '40%', left: '50%' }
  }

  const comboY = LOSE_LINE_Y * COMBO_CALLOUT_Y_RATIO
  const topPx = (comboY / GAME_HEIGHT) * props.displayHeight

  return {
    top: `${topPx}px`,
    left: '50%',
  }
})

const themeStyle = computed(() => {
  if (!shown.value) return {}
  const style = getComboCalloutStyle(shown.value.combo)
  const scale = props.displayWidth > 0 ? props.displayWidth / GAME_WIDTH : 1

  return {
    '--combo-fill': style.fill,
    '--combo-glow': style.glow,
    '--combo-flash': style.flash,
    '--combo-font-size': `${style.fontSize}px`,
    '--callout-scale': String(scale),
  }
})

function clearTimeline(): void {
  timeline?.kill()
  timeline = null
}

watch(
  () => props.callout,
  async (callout) => {
    if (!callout) return

    clearTimeline()
    shown.value = callout
    await nextTick()

    if (!motionRef.value) return
    timeline = animateComboCallout(motionRef.value)
    timeline.eventCallback('onComplete', () => {
      if (shown.value?.createdAt === callout.createdAt) {
        shown.value = null
      }
    })
  },
)

onBeforeUnmount(() => {
  clearTimeline()
})
</script>

<template>
  <div
    v-if="shown"
    class="combo-callout"
    :style="[anchorStyle, themeStyle]"
    aria-live="polite"
    aria-atomic="true"
  >
    <div ref="motionRef" class="combo-callout__motion">
      <div class="combo-callout__glow" aria-hidden="true" />
      <div class="combo-callout__stars" aria-hidden="true">
        <span class="combo-callout__star combo-callout__star--a">★</span>
        <span class="combo-callout__star combo-callout__star--b">★</span>
        <span class="combo-callout__star combo-callout__star--c">★</span>
      </div>
      <p class="combo-callout__phrase">
        <span
          v-for="(char, index) in comboChars"
          :key="`${shown?.createdAt}-${index}`"
          class="combo-callout__char"
        >
          {{ char }}
        </span>
      </p>
      <span class="combo-callout__badge">×{{ shown.combo }}</span>
    </div>
  </div>
</template>

<style scoped>
.combo-callout {
  position: absolute;
  z-index: 4;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.combo-callout__motion {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: max-content;
  max-width: 92vw;
  will-change: transform, opacity;
}

.combo-callout__glow {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 0;
  width: calc(120px * var(--callout-scale, 1));
  height: calc(90px * var(--callout-scale, 1));
  border-radius: 50%;
  background: radial-gradient(
    ellipse at center,
    var(--combo-flash) 0%,
    color-mix(in srgb, var(--combo-glow) 35%, transparent) 48%,
    transparent 72%
  );
  transform: translate(-50%, -50%);
  filter: blur(calc(2px * var(--callout-scale, 1)));
}

.combo-callout__stars {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.combo-callout__star {
  position: absolute;
  color: #c084fc;
  font-size: calc(14px * var(--callout-scale, 1));
  text-shadow:
    0 0 8px rgba(192, 132, 252, 0.85),
    0 1px 2px rgba(40, 10, 60, 0.45);
}

.combo-callout__star--a {
  top: 8%;
  left: 18%;
}

.combo-callout__star--b {
  top: 2%;
  right: 22%;
}

.combo-callout__star--c {
  bottom: 8%;
  left: 42%;
}

.combo-callout__phrase {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.02em;
  margin: 0;
  font-family: var(--font-game);
  font-size: calc(var(--combo-font-size, 36px) * var(--callout-scale, 1));
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.01em;
  text-align: center;
  white-space: nowrap;
}

.combo-callout__char {
  display: inline-block;
  transform-origin: center bottom;
  color: var(--combo-fill);
  -webkit-text-stroke: calc(3px * var(--callout-scale, 1)) rgba(40, 12, 0, 0.95);
  paint-order: stroke fill;
  text-shadow:
    0 0 calc(14px * var(--callout-scale, 1)) var(--combo-glow),
    0 calc(2px * var(--callout-scale, 1)) calc(4px * var(--callout-scale, 1)) rgba(0, 0, 0, 0.35);
}

.combo-callout__badge {
  position: relative;
  z-index: 2;
  margin-top: calc(4px * var(--callout-scale, 1));
  font-family: var(--font-game);
  font-size: calc(var(--combo-font-size, 36px) * 0.44 * var(--callout-scale, 1));
  font-weight: 800;
  line-height: 1;
  color: #fff;
  -webkit-text-stroke: calc(2px * var(--callout-scale, 1)) rgba(30, 10, 0, 0.85);
  paint-order: stroke fill;
  text-shadow: 0 0 calc(10px * var(--callout-scale, 1)) var(--combo-glow);
  transform-origin: center center;
}
</style>
