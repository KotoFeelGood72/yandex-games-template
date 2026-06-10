# Yandex Games Template

Vue 3 + Vite + Pinia шаблон для игр под Яндекс.Игры. Содержит готовую обёртку
над Yandex Games SDK и модуль рекламы.

## Что включено

- **`src/yandex/sdk.ts`** — инициализация SDK, `getLang()`,
  reference-counted `gameplayPause()` / `gameplayResume()`, `tryRequestReview()`.
- **`src/ads/ads.ts`** — `showInterstitial()` и `showRewarded()` с кулдаунами
  (60s после старта, 90s между показами) и автопаузой через события
  `window:ads:pause` / `window:ads:resume`.
- **`src/audio/sounds.ts`** — обёртка над Web Audio API (без файлов),
  учитывает требования Яндекса: пауза при `document.hidden`, подавление
  Media Session API.
- **`src/stores/`** — пустой каркас для Pinia сторов.
- **`index.html`** — подключает Yandex `/sdk.js` (в проде даёт его Яндекс,
  в dev — мягко падает на dev-стабы).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
