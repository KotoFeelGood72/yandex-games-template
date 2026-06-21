import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useInputStore = defineStore('input', () => {
  const moveX = ref(0)
  const moveY = ref(0)
  const interactHeld = ref(false)
  const dashPressed = ref(false)

  function setMove(x: number, y: number): void {
    moveX.value = x
    moveY.value = y
  }

  function setInteract(held: boolean): void {
    interactHeld.value = held
  }

  function triggerDash(): void {
    dashPressed.value = true
  }

  function consumeDashPress(): boolean {
    if (!dashPressed.value) return false
    dashPressed.value = false
    return true
  }

  function reset(): void {
    moveX.value = 0
    moveY.value = 0
    interactHeld.value = false
    dashPressed.value = false
  }

  return {
    moveX,
    moveY,
    interactHeld,
    dashPressed,
    setMove,
    setInteract,
    triggerDash,
    consumeDashPress,
    reset,
  }
})
