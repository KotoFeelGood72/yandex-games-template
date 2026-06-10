<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    maxHeight?: string
    /** Явная высота (например 100dvh для экрана игры) */
    height?: string
    /** Высота по контенту, но не больше maxHeight (для модалок) */
    fitContent?: boolean
  }>(),
  {
    maxHeight: '100%',
    fitContent: false,
  },
)

const viewportRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

const scrollTop = ref(0)
const viewportHeight = ref(0)
const contentHeight = ref(0)
const dragging = ref(false)

let dragStartY = 0
let dragStartScroll = 0
let resizeObserver: ResizeObserver | null = null

const SCROLL_OVERFLOW_TOLERANCE = 6

const maxScroll = computed(() => Math.max(0, contentHeight.value - viewportHeight.value))
const canScroll = computed(() => maxScroll.value > SCROLL_OVERFLOW_TOLERANCE)

const thumbHeight = computed(() => {
  if (!canScroll.value || viewportHeight.value <= 0) return 0
  const minThumb = 52
  const ratio = viewportHeight.value / contentHeight.value
  return Math.max(minThumb, Math.round(viewportHeight.value * ratio))
})

const thumbTop = computed(() => {
  if (!canScroll.value || maxScroll.value <= 0) return 0
  const track = viewportHeight.value - thumbHeight.value
  return (scrollTop.value / maxScroll.value) * track
})

const thumbStyle = computed(() => ({
  height: `${thumbHeight.value}px`,
  transform: `translate(-50%, ${thumbTop.value}px)`,
}))

const contentStyle = computed(() => ({
  transform: `translateY(${-scrollTop.value}px)`,
}))

const rootStyle = computed(() => {
  if (props.height) {
    return { maxHeight: props.maxHeight, height: props.height }
  }
  if (props.fitContent && viewportHeight.value > 0) {
    return { maxHeight: props.maxHeight, height: `${viewportHeight.value}px` }
  }
  return { maxHeight: props.maxHeight }
})

const viewportStyle = computed(() => {
  if (!props.fitContent || viewportHeight.value <= 0) return undefined
  return {
    height: `${viewportHeight.value}px`,
    maxHeight: `${viewportHeight.value}px`,
    minHeight: 0,
  }
})

function measureCssMaxHeight(value: string, fallback = 480): number {
  if (typeof document === 'undefined') return fallback
  const probe = document.createElement('div')
  probe.style.cssText = `position:fixed;visibility:hidden;max-height:${value};height:${value};width:1px;`
  document.body.appendChild(probe)
  const height = probe.offsetHeight
  document.body.removeChild(probe)
  return height > 0 ? height : fallback
}

function clampScroll(value: number) {
  return Math.min(maxScroll.value, Math.max(0, value))
}

function measure() {
  const contentH = contentRef.value?.scrollHeight ?? 0
  contentHeight.value = contentH

  if (props.fitContent) {
    const cap = measureCssMaxHeight(props.maxHeight)
    viewportHeight.value = Math.min(contentH, cap)
  } else {
    viewportHeight.value = viewportRef.value?.clientHeight ?? 0
  }

  scrollTop.value = clampScroll(scrollTop.value)
}

function scrollBy(delta: number) {
  scrollTop.value = clampScroll(scrollTop.value + delta)
}

function onWheel(e: WheelEvent) {
  if (!canScroll.value) return
  e.preventDefault()
  scrollBy(e.deltaY)
}

function onTrackPointerDown(e: PointerEvent) {
  if (!canScroll.value) return
  const track = e.currentTarget as HTMLElement
  const rect = track.getBoundingClientRect()
  const y = e.clientY - rect.top - thumbHeight.value / 2
  const trackRange = viewportHeight.value - thumbHeight.value
  const next = trackRange > 0 ? (y / trackRange) * maxScroll.value : 0
  scrollTop.value = clampScroll(next)
}

function onThumbPointerDown(e: PointerEvent) {
  if (!canScroll.value) return
  dragging.value = true
  dragStartY = e.clientY
  dragStartScroll = scrollTop.value
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onThumbPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  const trackRange = viewportHeight.value - thumbHeight.value
  if (trackRange <= 0) return
  const delta = e.clientY - dragStartY
  scrollTop.value = clampScroll(dragStartScroll + (delta / trackRange) * maxScroll.value)
}

function onThumbPointerUp(e: PointerEvent) {
  dragging.value = false
  try {
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  } catch {
    /* ignore */
  }
}

let touchStartY = 0
let touchStartScroll = 0

function onTouchStart(e: TouchEvent) {
  if (!canScroll.value || e.touches.length !== 1) return
  touchStartY = e.touches[0]!.clientY
  touchStartScroll = scrollTop.value
}

function onTouchMove(e: TouchEvent) {
  if (!canScroll.value || e.touches.length !== 1) return
  e.preventDefault()
  const delta = touchStartY - e.touches[0]!.clientY
  scrollTop.value = clampScroll(touchStartScroll + delta)
}

onMounted(() => {
  void nextTick(measure)
  resizeObserver = new ResizeObserver(() => measure())
  if (viewportRef.value) resizeObserver.observe(viewportRef.value)
  if (contentRef.value) resizeObserver.observe(contentRef.value)
  window.addEventListener('resize', measure)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', measure)
})

watch(maxScroll, () => {
  scrollTop.value = clampScroll(scrollTop.value)
})

defineExpose({
  refresh: measure,
  scrollToTop: () => {
    scrollTop.value = 0
  },
})
</script>

<template>
  <div class="custom-scroll" :style="rootStyle">
    <div
      ref="viewportRef"
      class="custom-scroll__viewport"
      :style="viewportStyle"
      @wheel="onWheel"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
    >
      <div ref="contentRef" class="custom-scroll__content" :style="contentStyle">
        <slot />
      </div>
    </div>

    <div
      v-if="canScroll"
      class="custom-scroll__track"
      aria-hidden="true"
      @pointerdown="onTrackPointerDown"
    >
      <div
        class="custom-scroll__thumb"
        :class="{ 'custom-scroll__thumb--dragging': dragging }"
        :style="thumbStyle"
        @pointerdown.stop="onThumbPointerDown"
        @pointermove="onThumbPointerMove"
        @pointerup="onThumbPointerUp"
        @pointercancel="onThumbPointerUp"
      />
    </div>
  </div>
</template>

<style scoped>
.custom-scroll {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 4px;
  width: 100%;
  min-height: 0;
  max-height: 100%;
  overflow: hidden;
}

.custom-scroll__viewport {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  touch-action: none;
}

.custom-scroll__content {
  will-change: transform;
}

.custom-scroll__track {
  position: relative;
  flex-shrink: 0;
  width: 20px;
  margin: 2px 0;
  cursor: pointer;
  z-index: 2;
  pointer-events: auto;
}

.custom-scroll__track::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  border-radius: 999px;
  background: linear-gradient(180deg, #fff9ef 0%, #f5e6c8 52%, #edd9b0 100%);
  box-shadow:
    inset 0 1px 3px rgba(255, 255, 255, 0.85),
    inset 0 -1px 2px rgba(120, 80, 40, 0.12);
  pointer-events: none;
}

.custom-scroll__thumb {
  position: absolute;
  left: 50%;
  top: 0;
  z-index: 1;
  width: 10px;
  border: none;
  border-radius: 999px;
  background-color: #e89528;
  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, 0.28) 0%, transparent 46%, rgba(0, 0, 0, 0.08) 100%),
    repeating-linear-gradient(
      -45deg,
      #ffd060 0,
      #ffd060 4px,
      #f0a028 4px,
      #f0a028 8px
    );
  background-size:
    100% 100%,
    11.31px 11.31px;
  animation: custom-scroll-stripes 0.55s linear infinite;
  box-shadow: 0 1px 4px rgba(40, 24, 10, 0.28);
  cursor: grab;
  touch-action: none;
  overflow: hidden;
}

.custom-scroll__thumb--dragging {
  cursor: grabbing;
  filter: brightness(1.04);
}

@keyframes custom-scroll-stripes {
  from {
    background-position:
      0 0,
      0 0;
  }

  to {
    background-position:
      0 0,
      11.31px 0;
  }
}
</style>
