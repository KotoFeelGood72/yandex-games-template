import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { vGsapPress } from '@/directives/gsapPress'
import { gameplayPause, gameplayResume } from '@/yandex/sdk'
import { bindProgressLifecycle } from '@/yandex/progressLifecycle'

window.addEventListener('contextmenu', (e) => e.preventDefault())
window.addEventListener('selectstart', (e) => e.preventDefault())
window.addEventListener('dragstart', (e) => e.preventDefault())
window.addEventListener('gesturestart', (e) => e.preventDefault())
document.addEventListener(
  'touchmove',
  (e) => {
    if (e.touches.length > 1) e.preventDefault()
  },
  { passive: false },
)

const app = createApp(App)
app.directive('gsap-press', vGsapPress)
app.use(createPinia())
app.use(router)
app.mount('#app')
bindProgressLifecycle()

document.addEventListener('visibilitychange', () => {
  if (document.hidden) gameplayPause()
  else gameplayResume()
})

window.addEventListener('ads:pause', () => gameplayPause())
window.addEventListener('ads:resume', () => gameplayResume())
