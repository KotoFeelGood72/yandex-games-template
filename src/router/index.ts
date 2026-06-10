import { createRouter, createMemoryHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  // Memory history — игра встраивается в iframe Яндекса с непредсказуемым
  // path; createWebHistory не сможет смэтчить такой URL на наши routes.
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
  ],
})

export default router
