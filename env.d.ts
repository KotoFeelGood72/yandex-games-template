/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/vue" />

declare module '*.json' {
  const value: Record<string, unknown>
  export default value
}

declare module 'lottie-web/build/player/lottie_canvas' {
  export interface AnimationItem {
    addEventListener(name: string, callback: () => void): void
    destroy(): void
  }

  interface LottieCanvas {
    loadAnimation(params: {
      container: Element
      renderer: 'canvas'
      loop: boolean
      autoplay: boolean
      animationData: Record<string, unknown>
    }): AnimationItem
  }

  const lottie: LottieCanvas
  export default lottie
}
