<script setup lang="ts">
defineProps<{
  show: boolean
  title: string
  primaryLabel: string
  secondaryLabel?: string
}>()

const emit = defineEmits<{
  primary: []
  secondary: []
}>()
</script>

<template>
  <div v-if="show" class="message">
    <div class="message__box">
      <p class="message__title">{{ title }}</p>
      <div class="message__actions">
        <button type="button" class="message__btn" @click="emit('primary')">
          {{ primaryLabel }}
        </button>
        <button
          v-if="secondaryLabel"
          type="button"
          class="message__btn"
          @click="emit('secondary')"
        >
          {{ secondaryLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message {
  position: absolute;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(238, 228, 218, 0.73);
  border-radius: 6px;
  animation: fade-in 0.3s ease-in-out;
}

.message__box {
  text-align: center;
}

.message__title {
  font-family: var(--font-game);
  font-size: 60px;
  font-weight: 700;
  color: #776e65;
  margin: 0 0 24px;
  line-height: 1.1;
}

.message__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.message__btn {
  background: #8f7a66;
  border: none;
  border-radius: 3px;
  color: #f9f6f2;
  cursor: pointer;
  font: 600 16px/1 var(--font-game);
  padding: 12px 24px;
  min-width: 140px;
}

.message__btn:hover {
  background: #9f8b77;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 520px) {
  .message__title {
    font-size: 36px;
  }
}
</style>
