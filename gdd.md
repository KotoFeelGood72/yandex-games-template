# NEON_HIDE_AND_SEEK_GDD_TZ.md

# Neon Stick Hunt

## 1. Жанр

Командная аркадная игра:

* прятки;
* сбор ресурсов;
* риск / награда;
* асинхронный мультиплеер;
* короткие матчи 5–7 минут.

---

## 2. Основная идея

Игроки делятся на две команды.

Команды бегают по большой неоновой территории и собирают светящиеся палочки.

Обычные палочки можно обменять у торговца на более ценные суши-палочки.

По территории ходят ловцы. Если ловец касается игрока, игрок теряет часть палочек, и они случайно разлетаются рядом.

Каждые 2 минуты один из ловцов становится торговцем. Подход к торговцу — это риск, потому что рядом могут быть ловцы и игроки другой команды.

Побеждает команда, которая набрала больше очков за матч.

---

# 3. Core Loop

## Во время матча

1. Игрок появляется на базе своей команды.
2. Игрок ищет обычные неоновые палочки.
3. Игрок собирает палочки.
4. Игрок решает: продолжать собирать или идти к торговцу.
5. Игрок ищет торговца.
6. Игрок обменивает палочки на суши-палочки.
7. Игрок избегает ловцов.
8. Если ловец поймал игрока — часть палочек выпадает.
9. Игрок возвращается к сбору.
10. По окончании таймера сравниваются очки команд.

---

# 4. Команды

На старте матча игроки делятся на:

* Blue Team
* Pink Team

Для MVP можно сделать:

* реальный игрок в одной команде;
* команда противника имитируется ботами и асинхронными записями игроков.

---

# 5. Ресурсы

## Neon Stick

Обычная палочка.

* даёт 1 очко;
* часто лежит на карте;
* быстро собирается.

## Sushi Neon Stick

Ценная палочка.

* создаётся через обмен у торговца;
* стоит 10 очков;
* требует 5 обычных палочек для обмена.

## Golden Sushi Stick

Редкая палочка.

* появляется 1 раз за матч;
* стоит 50 очков;
* отображается на мини-карте;
* создаёт конфликт между командами.

---

# 6. Торговец

Торговец — ключевой рискованный объект.

## Правила

* Торговец появляется каждые 2 минуты.
* Торговцем становится один случайный ловец.
* Старый торговец снова становится ловцом.
* Торговец отмечается на карте только примерной зоной, а не точной точкой.
* Обмен занимает 2 секунды.
* Во время обмена игрок уязвим.

## Обмен

5 обычных палочек = 1 суши-палочка.

Баланс:

* обычная палочка = 1 очко;
* суши-палочка = 10 очков.

Игрок получает выгоду, но рискует потерять собранные ресурсы.

---

# 7. Ловцы

Ловцы — NPC, которые патрулируют территорию.

## Поведение

* ходят по маршрутам;
* реагируют на игрока в радиусе;
* преследуют игрока несколько секунд;
* после потери цели возвращаются к патрулю.

## Если ловец поймал игрока

Игрок:

* теряет 50% обычных палочек;
* теряет 30% суши-палочек;
* ресурсы разлетаются по территории рядом с местом поимки;
* получает короткую неуязвимость 2 секунды;
* отбрасывается назад.

Не отнимать всё полностью, чтобы игрок не бросал игру после одной ошибки.

---

# 8. Очки

В конце матча:

```ts
score = neonSticks * 1 + sushiSticks * 10 + goldenSushiSticks * 50
```

Побеждает команда с большим суммарным счётом.

---

# 9. Карта

## Структура карты

Карта должна быть большой, но читаемой.

Зоны:

1. Центр карты — опасная зона с большим количеством палочек.
2. Базы команд — безопасные стартовые зоны.
3. Торговые зоны — места, где чаще появляются торговцы.
4. Узкие проходы — рискованные пути.
5. Укрытия — места для скрытия от ловцов.
6. Неоновые тоннели — быстрые маршруты.

## Для MVP

Сделать одну карту:

* top-down 2D;
* размер 3000×3000;
* камера следует за игроком;
* объекты карты не должны ломать навигацию;
* ловцы должны обходить препятствия простым способом.

---

# 10. Управление

ПК:

* WASD / стрелки — движение;
* E — взаимодействие с торговцем;
* Shift — короткий рывок;
* Tab — таблица команд.

Мобильные:

* виртуальный джойстик слева;
* кнопка взаимодействия справа;
* кнопка рывка справа.

---

# 11. Способности игрока

Для MVP:

## Dash

Короткий рывок.

* cooldown: 6 секунд;
* помогает сбежать от ловца;
* нельзя использовать во время обмена.

## Hide

Короткое скрытие.

* игрок становится менее заметным для ловцов;
* cooldown: 12 секунд;
* длительность: 2 секунды.

---

# 12. Роли игроков

После MVP добавить классы.

## Scout

* быстрее видит палочки;
* видит примерное направление торговца.

## Runner

* быстрее двигается;
* чаще использует dash.

## Banker

* меньше теряет при поимке;
* выгоднее обменивает палочки.

## Trickster

* может создавать ложную приманку для ловцов.

---

# 13. Матч

## Длительность

MVP: 5 минут.

Позже: 7 минут.

## Фазы матча

### 0:00–2:00

Сбор палочек.

### 2:00

Первый ловец становится торговцем.

### 2:00–4:00

Игроки начинают рисковать ради обмена.

### 4:00

Новый торговец.

### Последняя минута

Появляется Golden Sushi Stick.

---

# 14. Асинхронный мультиплеер Яндекс Игр

## Важно

Асинхронный мультиплеер Яндекс Игр не является настоящим realtime multiplayer.

Он работает так:

1. Игрок A играет матч.
2. Игра записывает важные события игрока во время матча.
3. SDK сохраняет timeline на сервере.
4. Игрок B запускает матч.
5. SDK загружает записанные сессии других игроков.
6. Игра воспроизводит их действия как будто это живые противники.

Официальный принцип: SDK записывает ключевые события и timestamps, сохраняет их как timeline, затем у других игроков воспроизводит эти действия в реальном времени.

---

# 15. Как использовать async multiplayer в этой игре

## Что записывать

Не записывать каждый кадр.

Записывать только важные события:

```ts
type MultiplayerEvent =
  | { type: "move"; x: number; y: number; vx: number; vy: number }
  | { type: "collect"; stickId: string }
  | { type: "exchange"; traderId: string; amount: number }
  | { type: "caught"; catcherId: string; lostNeon: number; lostSushi: number }
  | { type: "dash"; x: number; y: number; dirX: number; dirY: number }
  | { type: "hide"; x: number; y: number }
  | { type: "score"; team: "blue" | "pink"; score: number };
```

## Частота записи

Movement:

* не чаще 5 раз в секунду;
* только если позиция изменилась заметно.

Важные события:

* сразу при событии.

## Зачем так

Если записывать позицию каждый кадр, timeline станет тяжёлым.

Асинхронный мультиплеер должен хранить компактные события.

---

# 16. Инициализация SDK

Создать файл:

```ts
src/services/yandexSdk.ts
```

Пример:

```ts
let ysdk: any = null;

export async function initYandexSdk() {
  if (ysdk) return ysdk;

  if (!(window as any).YaGames) {
    console.warn("Yandex SDK not found. Running local fallback.");
    return null;
  }

  ysdk = await (window as any).YaGames.init();
  return ysdk;
}

export function getYsdk() {
  return ysdk;
}
```

SDK нужно инициализировать до вызова методов. В документации показан пример: сначала `const ysdk = await YaGames.init();`, потом вызовы SDK.

---

# 17. Загрузка асинхронных сессий

Создать файл:

```ts
src/services/asyncMultiplayer.ts
```

```ts
import { initYandexSdk } from "./yandexSdk";

export async function initAsyncMultiplayer(playerRating: number, playerLevel: number) {
  const ysdk = await initYandexSdk();

  if (!ysdk?.multiplayer?.sessions) {
    console.warn("Async multiplayer unavailable. Use bot fallback.");
    return [];
  }

  const opponents = await ysdk.multiplayer.sessions.init({
    count: 3,
    isEventBased: true,
    maxOpponentTurnTime: 300,
    meta: {
      meta1: {
        min: Math.max(0, playerRating - 500),
        max: playerRating + 500,
      },
      meta2: {
        min: Math.max(1, playerLevel - 3),
        max: playerLevel + 3,
      },
    },
  });

  return opponents;
}
```

Важно:

* `count` — количество загружаемых сессий, максимум 10.
* Для загрузки сессий нужно передать хотя бы один `meta` параметр и `count > 0`.
* `meta1`, `meta2`, `meta3` используются для подбора сессий.
* `isEventBased: true` позволяет получать события через SDK.
* `maxOpponentTurnTime` ограничивает слишком длинные паузы между событиями противника.

---

# 18. Запись событий игрока

```ts
import { initYandexSdk } from "./yandexSdk";

export async function commitMultiplayerEvent(payload: any) {
  const ysdk = await initYandexSdk();

  if (!ysdk?.multiplayer?.sessions) return;

  try {
    ysdk.multiplayer.sessions.commit(payload);
  } catch (e) {
    console.warn("Failed to commit multiplayer event", e);
  }
}
```

Использовать:

```ts
commitMultiplayerEvent({
  type: "collect",
  stickId: stick.id,
  x: player.x,
  y: player.y,
});
```

Метод `commit()` принимает payload события, а `id` и время с начала матча SDK рассчитывает сам, поэтому важно отправлять payload в нужный момент игрового события.

---

# 19. Сохранение сессии после матча

```ts
export async function pushMultiplayerSession(score: number, playerLevel: number, teamScore: number) {
  const ysdk = await initYandexSdk();

  if (!ysdk?.multiplayer?.sessions) return;

  try {
    await ysdk.multiplayer.sessions.push({
      meta1: score,
      meta2: playerLevel,
      meta3: teamScore,
    });
  } catch (e) {
    console.warn("Failed to push multiplayer session", e);
  }
}
```

Метод `push()` сохраняет timeline на сервере в конце игры. При сохранении нужно указать хотя бы один meta-параметр.

---

# 20. Получение событий противников

При `isEventBased: true` подписаться на события:

```ts
export async function subscribeAsyncOpponentEvents(onTransaction: Function, onFinish: Function) {
  const ysdk = await initYandexSdk();

  if (!ysdk?.on) return;

  ysdk.on("multiplayer-sessions-transaction", (event: any) => {
    onTransaction(event);
  });

  ysdk.on("multiplayer-sessions-finish", (event: any) => {
    onFinish(event);
  });
}
```

SDK умеет отдавать события противника в момент, соответствующий записанным timestamp. Для event-based режима используются события `multiplayer-sessions-transaction` и `multiplayer-sessions-finish`.

---

# 21. Воспроизведение противников

Каждая загруженная сессия создаёт ghost-player.

Ghost-player:

* имеет команду;
* двигается по записанным координатам;
* собирает палочки визуально;
* может приносить очки команде;
* может быть пойман ловцом;
* не должен ломать основной матч, если запись неполная.

Логика:

```ts
function applyOpponentEvent(ghost: GhostPlayer, payload: MultiplayerEvent) {
  switch (payload.type) {
    case "move":
      ghost.setTargetPosition(payload.x, payload.y);
      break;

    case "collect":
      ghost.playCollectAnimation(payload.stickId);
      break;

    case "exchange":
      ghost.playExchangeAnimation(payload.traderId);
      break;

    case "caught":
      ghost.playCaughtAnimation();
      break;

    case "dash":
      ghost.playDash(payload.dirX, payload.dirY);
      break;

    case "hide":
      ghost.playHide();
      break;

    case "score":
      ghost.setScore(payload.score);
      break;
  }
}
```

---

# 22. Командный режим через async multiplayer

Так как это не realtime, нельзя делать честное одновременное PvP.

Правильная модель:

* игрок играет матч против ghost-команды;
* ghost-команда собрана из записей других игроков;
* визуально это выглядит как командный матч;
* итоговый счёт сравнивается с суммой записанных результатов противников;
* новые результаты игрока сохраняются для будущих матчей.

## Подбор

Использовать meta:

* `meta1` = финальный счёт игрока;
* `meta2` = уровень аккаунта;
* `meta3` = длительность матча или сложность карты.

---

# 23. Fallback без SDK

Если SDK недоступен:

* создать 3–5 ботов;
* имитировать команду противника;
* сохранять прогресс в LocalStorage;
* игра должна работать локально без ошибок.

---

# 24. Техническая архитектура

## Phaser scenes

```txt
BootScene
PreloadScene
MainMenuScene
MatchScene
HUDScene
ResultScene
```

## Systems

```txt
TeamSystem
StickSpawnSystem
TraderSystem
CatcherSystem
ExchangeSystem
DropSystem
ScoreSystem
AsyncMultiplayerSystem
BotSystem
MatchTimerSystem
MinimapSystem
```

## Entities

```txt
Player
GhostPlayer
BotPlayer
Catcher
Trader
NeonStick
SushiStick
GoldenSushiStick
DropPile
TeamBase
```

---

# 25. Структура проекта

```txt
src/
  game/
    scenes/
      BootScene.ts
      PreloadScene.ts
      MainMenuScene.ts
      MatchScene.ts
      HUDScene.ts
      ResultScene.ts

    entities/
      Player.ts
      GhostPlayer.ts
      BotPlayer.ts
      Catcher.ts
      Trader.ts
      Stick.ts
      DropPile.ts

    systems/
      TeamSystem.ts
      StickSpawnSystem.ts
      TraderSystem.ts
      CatcherSystem.ts
      ExchangeSystem.ts
      DropSystem.ts
      ScoreSystem.ts
      AsyncMultiplayerSystem.ts
      BotSystem.ts
      MatchTimerSystem.ts
      MinimapSystem.ts

    data/
      matchConfig.ts
      mapConfig.ts
      stickConfig.ts
      catcherConfig.ts
      traderConfig.ts
      rolesConfig.ts

  services/
    yandexSdk.ts
    asyncMultiplayer.ts

  stores/
    matchStore.ts
    playerStore.ts
    metaStore.ts
```

---

# 26. MVP задачи для Cursor

## Этап 1

Переделать старую arena survivor структуру в hide-and-seek match.

Сделать:

* карту;
* игрока;
* движение;
* камеру;
* сбор обычных палочек.

## Этап 2

Добавить:

* команды;
* счёт команды;
* таймер матча;
* HUD.

## Этап 3

Добавить:

* ловцов;
* патруль;
* преследование игрока;
* потерю палочек при касании.

## Этап 4

Добавить:

* торговца;
* смену торговца каждые 2 минуты;
* обмен палочек;
* риск во время обмена.

## Этап 5

Добавить:

* ботов;
* ghost-player;
* имитацию команды противника.

## Этап 6

Добавить:

* Yandex SDK init;
* async multiplayer init;
* commit событий;
* push результатов;
* replay событий противников.

---

# 27. Критерии готовности MVP

Игра готова как MVP, если:

* матч длится 5 минут;
* игрок собирает палочки;
* есть 2 команды;
* есть счёт команд;
* ловцы ходят по карте;
* ловцы могут поймать игрока;
* при поимке палочки разлетаются;
* торговец появляется каждые 2 минуты;
* можно обменять палочки на суши-палочки;
* в конце матча показывается победитель;
* без SDK работают боты;
* с SDK записываются и воспроизводятся ghost-сессии.
