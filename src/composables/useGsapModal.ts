import gsap from 'gsap'
import { nextTick, onUnmounted, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'

import {
  animateOverlayIn,
  animateModalPanelIn,
  animateRibbonIn,
  animateScorePop,
  animateStarSpin,
  animateStaggerIn,
} from '@/shared/animations/gsapPresets'

type GsapModalOptions = {
  staggerSelector?: string
  ribbonRef?: Ref<HTMLElement | null>
  scoreRef?: Ref<HTMLElement | null>
  starRef?: Ref<HTMLElement | null>
}

export function useGsapModal(
  show: MaybeRefOrGetter<boolean>,
  overlayRef: Ref<HTMLElement | null>,
  panelRef: Ref<HTMLElement | null>,
  options?: GsapModalOptions,
): void {
  let ctx: gsap.Context | null = null

  watch(
    () => toValue(show),
    async (visible) => {
      if (!visible) {
        ctx?.revert()
        ctx = null
        return
      }

      await nextTick()

      const overlay = overlayRef.value
      const panel = panelRef.value
      if (!overlay || !panel) return

      ctx?.revert()
      ctx = gsap.context(() => {
        animateOverlayIn(overlay)
        animateModalPanelIn(panel)

        if (options?.ribbonRef?.value) {
          animateRibbonIn(options.ribbonRef.value)
        }

        if (options?.starRef?.value) {
          animateStarSpin(options.starRef.value)
        }

        if (options?.scoreRef?.value) {
          animateScorePop(options.scoreRef.value)
        }

        if (options?.staggerSelector) {
          animateStaggerIn(panel, options.staggerSelector, { y: 10, stagger: 0.07, delay: 0.18 })
        }
      })
    },
    { immediate: true },
  )

  onUnmounted(() => {
    ctx?.revert()
  })
}
