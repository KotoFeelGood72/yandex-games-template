import lottie, { type AnimationItem } from 'lottie-web/build/player/lottie_canvas'

import boomAnimation from '@/assets/effect-boom.json'

const BOOM_BASE_SIZE = 100
const BOOM_DURATION_MS = 1000
const BOOM_MIN_SCALE = 1.6
const BOOM_MAX_SCALE = 3.8

/** Убираем центральный расширяющийся круг — оставляем звёзды и частицы */
const BOOM_ANIMATION = prepareBoomAnimation(boomAnimation)

function prepareBoomAnimation(data: Record<string, unknown>): Record<string, unknown> {
  const clone = structuredClone(data)
  const layers = clone.layers as Array<{ nm?: string }> | undefined
  if (!layers) return clone
  clone.layers = layers.filter((layer) => layer.nm !== 'Shape Layer 1')
  return clone
}

interface BoomInstance {
  x: number
  y: number
  scale: number
  anim: AnimationItem
  wrapper: HTMLDivElement
  canvas: HTMLCanvasElement
  createdAt: number
}

class MergeBoomPlayer {
  private instances = new Map<number, BoomInstance>()

  spawn(id: number, x: number, y: number, objectRadius: number): void {
    if (this.instances.has(id)) return

    const wrapper = document.createElement('div')
    wrapper.style.cssText =
      'position:fixed;left:-9999px;top:-9999px;width:100px;height:100px;pointer-events:none;visibility:hidden'
    document.body.appendChild(wrapper)

    const anim = lottie.loadAnimation({
      container: wrapper,
      renderer: 'canvas',
      loop: false,
      autoplay: true,
      animationData: BOOM_ANIMATION,
    })

    const register = (): void => {
      const canvas = wrapper.querySelector('canvas')
      if (!canvas) {
        this.remove(id)
        return
      }

      const scale = Math.max(
        BOOM_MIN_SCALE,
        Math.min(BOOM_MAX_SCALE, (objectRadius * 4) / BOOM_BASE_SIZE),
      )

      this.instances.set(id, {
        x,
        y,
        scale,
        anim,
        wrapper,
        canvas,
        createdAt: Date.now(),
      })
    }

    if ('isLoaded' in anim && (anim as { isLoaded: boolean }).isLoaded) {
      register()
    } else {
      anim.addEventListener('DOMLoaded', register)
    }
    anim.addEventListener('complete', () => this.remove(id))
  }

  draw(ctx: CanvasRenderingContext2D, now: number): void {
    for (const [id, inst] of this.instances) {
      if (now - inst.createdAt > BOOM_DURATION_MS + 200) {
        this.remove(id)
        continue
      }

      const size = BOOM_BASE_SIZE * inst.scale
      ctx.drawImage(inst.canvas, inst.x - size / 2, inst.y - size / 2, size, size)
    }
  }

  remove(id: number): void {
    const inst = this.instances.get(id)
    if (!inst) return
    inst.anim.destroy()
    inst.wrapper.remove()
    this.instances.delete(id)
  }

  clear(): void {
    for (const id of [...this.instances.keys()]) {
      this.remove(id)
    }
  }
}

export const mergeBoomPlayer = new MergeBoomPlayer()
