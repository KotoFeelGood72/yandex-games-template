<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useMetaStore } from '@/stores/metaStore'

const router = useRouter()
const metaStore = useMetaStore()

onMounted(() => {
  metaStore.load()
})

function startMatch(): void {
  router.push({ name: 'game' })
}
</script>

<template>
  <main class="hub">
    <header class="hub__header">
      <h1 class="hub__title">Neon Stick Hunt</h1>
      <p class="hub__subtitle">
        Командные прятки: собирай неоновые палочки, обменивай у торговца, избегай ловцов
      </p>
      <p class="hub__record">
        Лучший счёт Blue: <strong>{{ metaStore.bestKills }}</strong>
      </p>
    </header>

    <section class="hub__rules">
      <h2>Как играть</h2>
      <ul>
        <li>Собирай ⚡ неоновые палочки (+1 очко)</li>
        <li>Каждые 2 мин — торговец: 5 ⚡ = 1 🍣 суши-палочка (+10 очков)</li>
        <li>Ловцы забирают часть палочек при касании</li>
        <li>На 4-й минуте появляется ★ Golden Sushi (+50 очков)</li>
        <li>Матч 5 минут — побеждает команда с большим счётом</li>
      </ul>
    </section>

    <section class="hub__controls">
      <h2>Управление</h2>
      <p>WASD — движение · Shift — рывок · H — скрыться · E — обмен</p>
    </section>

    <footer class="hub__footer">
      <button type="button" class="hub__btn hub__btn--start" @click="startMatch">
        Начать матч
      </button>
    </footer>
  </main>
</template>

<style scoped>
.hub {
  min-height: 100dvh;
  padding: 24px 16px 100px;
  overflow-y: auto;
  background: #0a0814;
  color: #eef4ff;
}

.hub__header {
  text-align: center;
  margin-bottom: 32px;
}

.hub__title {
  margin: 0;
  font-size: clamp(28px, 6vw, 40px);
  background: linear-gradient(90deg, #00f5ff, #ff44cc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hub__subtitle {
  margin: 12px auto 0;
  max-width: 480px;
  opacity: 0.8;
  line-height: 1.5;
}

.hub__record strong {
  color: #00f5ff;
}

.hub__rules,
.hub__controls {
  max-width: 520px;
  margin: 0 auto 24px;
  padding: 16px;
  border-radius: 12px;
  background: #12102a;
  border: 1px solid rgba(0, 245, 255, 0.15);
}

.hub__rules h2,
.hub__controls h2 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #00f5ff;
}

.hub__rules ul {
  margin: 0;
  padding-left: 20px;
  line-height: 1.7;
  opacity: 0.9;
}

.hub__controls p {
  margin: 0;
  opacity: 0.75;
  font-size: 14px;
}

.hub__footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  background: rgba(10, 8, 20, 0.96);
  border-top: 1px solid rgba(0, 245, 255, 0.15);
}

.hub__btn {
  border: none;
  border-radius: 12px;
  padding: 14px;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  display: block;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
}

.hub__btn--start {
  background: linear-gradient(90deg, #00f5ff, #ff44cc);
  color: #0a0814;
}
</style>
