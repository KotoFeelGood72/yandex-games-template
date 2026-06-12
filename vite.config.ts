import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base:
    process.env.GITHUB_PAGES === 'true'
      ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'yandex-games-template'}/`
      : './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
