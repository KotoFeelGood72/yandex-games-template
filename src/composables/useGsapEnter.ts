import gsap from 'gsap'
import { nextTick, onMounted, onUnmounted, type Ref } from 'vue'

import {
  animateHubShell,
  animateIdleFloat,
  animatePopIn,
  animateSlideIn,
  animateStaggerIn,
} from '@/shared/animations/gsapPresets'

export function useGsapStaggerEnter(
  rootRef: Ref<HTMLElement | null>,
  selector: string,
  options?: { y?: number; stagger?: number; delay?: number },
): void {
  let ctx: gsap.Context | null = null

  onMounted(async () => {
    await nextTick()
    const root = rootRef.value
    if (!root) return

    ctx = gsap.context(() => {
      animateStaggerIn(root, selector, options)
    }, root)
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}

export function useGsapSlideEnter(
  targetRef: Ref<HTMLElement | null>,
  direction: 'top' | 'bottom' = 'top',
  delay = 0,
): void {
  let tween: gsap.core.Tween | null = null

  onMounted(async () => {
    await nextTick()
    if (!targetRef.value) return
    tween = animateSlideIn(targetRef.value, direction, { delay })
  })

  onUnmounted(() => {
    tween?.kill()
  })
}

export function useGsapPopEnter(targetRef: Ref<HTMLElement | null>, delay = 0): void {
  let tween: gsap.core.Tween | null = null

  onMounted(async () => {
    await nextTick()
    if (!targetRef.value) return
    tween = animatePopIn(targetRef.value, delay)
  })

  onUnmounted(() => {
    tween?.kill()
  })
}

export function useGsapIdleFloat(targetRef: Ref<HTMLElement | null>, delay = 0): void {
  let tween: gsap.core.Tween | null = null

  onMounted(async () => {
    await nextTick()
    if (!targetRef.value) return
    tween = gsap.delayedCall(delay, () => {
      if (targetRef.value) {
        tween = animateIdleFloat(targetRef.value)
      }
    })
  })

  onUnmounted(() => {
    tween?.kill()
  })
}

export function useGsapHubShell(
  layoutRef: Ref<HTMLElement | null>,
  headerRef: Ref<HTMLElement | null>,
  contentRef: Ref<HTMLElement | null>,
  navRef: Ref<HTMLElement | null>,
): void {
  let ctx: gsap.Context | null = null

  onMounted(async () => {
    await nextTick()
    if (!layoutRef.value) return

    ctx = gsap.context(() => {
      animateHubShell(headerRef.value, contentRef.value, navRef.value)
    }, layoutRef.value)
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}
