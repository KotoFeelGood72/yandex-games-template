import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { gameplayPause, gameplayResume } from '@/yandex/sdk'
import { bindProgressLifecycle } from '@/yandex/progressLifecycle'
import { bindPreventPullToRefresh } from '@/shared/utils/preventPullToRefresh'

window.addEventListener('contextmenu', (e) => e.preventDefault())
window.addEventListener('selectstart', (e) => e.preventDefault())
window.addEventListener('dragstart', (e) => e.preventDefault())
window.addEventListener('gesturestart', (e) => e.preventDefault())
bindPreventPullToRefresh()

const app = createApp(App)
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
