import { createRouter, createWebHistory } from 'vue-router'
import GameView from '../views/GameView.vue'
import HubView from '../views/HubView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'hub',
      component: HubView,
    },
    {
      path: '/run',
      name: 'game',
      component: GameView,
    },
  ],
})

export default router
