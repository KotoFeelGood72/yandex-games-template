import lottie, { type AnimationItem } from 'lottie-web/build/player/lottie_canvas'

import fallAnimation from '@/assets/fall.json'

const FALL_BASE_SIZE = 512

class FallEffectPlayer {
  private canvas: HTMLCanvasElement | null = null
  private anim: AnimationItem | null = null
  private wrapper: HTMLDivElement | null = null
  private ready = false
  private loadPromise: Promise<void> | null = null

  preload(): Promise<void> {
    if (this.ready) return Promise.resolve()
    if (this.loadPromise) return this.loadPromise

    this.loadPromise = new Promise((resolve) => {
      const wrapper = document.createElement('div')
      wrapper.style.cssText =
        'position:fixed;left:-9999px;top:-9999px;width:512px;height:512px;pointer-events:none;visibility:hidden'
      document.body.appendChild(wrapper)
      this.wrapper = wrapper

      const anim = lottie.loadAnimation({
        container: wrapper,
        renderer: 'canvas',
        loop: true,
        autoplay: true,
        animationData: fallAnimation,
      })
      this.anim = anim

      const register = (): void => {
        this.canvas = wrapper.querySelector('canvas')
        this.ready = !!this.canvas
        resolve()
      }

      if ('isLoaded' in anim && (anim as { isLoaded: boolean }).isLoaded) {
        register()
      } else {
        anim.addEventListener('DOMLoaded', register)
      }
    })

    return this.loadPromise
  }

  draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    anchorY: number,
    radius: number,
    options: { alpha?: number; intensity?: number } = {},
  ): void {
    if (!this.ready || !this.canvas) {
      void this.preload()
      return
    }

    const { alpha = 1, intensity = 1 } = options
    const scale = ((radius * 2.35) / FALL_BASE_SIZE) * (0.9 + intensity * 0.45)
    const size = FALL_BASE_SIZE * scale
    const drawX = x - size / 2
    const drawY = anchorY - size * 0.56

    ctx.save()
    ctx.globalAlpha = alpha
    ctx.drawImage(this.canvas, drawX, drawY, size, size)
    ctx.restore()
  }

  clear(): void {
    this.anim?.destroy()
    this.wrapper?.remove()
    this.anim = null
    this.wrapper = null
    this.canvas = null
    this.ready = false
    this.loadPromise = null
  }
}

export const fallEffectPlayer = new FallEffectPlayer()
