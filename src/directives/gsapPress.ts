import gsap from 'gsap'
import type { Directive } from 'vue'

type GsapPressBinding = number | undefined

const cleanupMap = new WeakMap<HTMLElement, () => void>()

function bindPress(el: HTMLElement, scale: number): () => void {
  const onDown = (): gsap.core.Tween =>
    gsap.to(el, { scale, duration: 0.08, ease: 'power2.out', overwrite: 'auto' })

  const onUp = (): gsap.core.Tween =>
    gsap.to(el, { scale: 1, duration: 0.18, ease: 'back.out(2)', overwrite: 'auto' })

  el.addEventListener('pointerdown', onDown)
  el.addEventListener('pointerup', onUp)
  el.addEventListener('pointerleave', onUp)
  el.addEventListener('pointercancel', onUp)

  return () => {
    el.removeEventListener('pointerdown', onDown)
    el.removeEventListener('pointerup', onUp)
    el.removeEventListener('pointerleave', onUp)
    el.removeEventListener('pointercancel', onUp)
    gsap.killTweensOf(el)
    gsap.set(el, { scale: 1 })
  }
}

export const vGsapPress: Directive<HTMLElement, GsapPressBinding> = {
  mounted(el, binding) {
    const scale = binding.value ?? 0.96
    cleanupMap.set(el, bindPress(el, scale))
  },
  updated(el, binding) {
    cleanupMap.get(el)?.()
    const scale = binding.value ?? 0.96
    cleanupMap.set(el, bindPress(el, scale))
  },
  unmounted(el) {
    cleanupMap.get(el)?.()
    cleanupMap.delete(el)
  },
}
