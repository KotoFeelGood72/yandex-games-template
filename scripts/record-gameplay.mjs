import { mkdir, rename } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'recordings')
const BASE_URL = process.env.GAME_URL ?? 'http://localhost:5173/'
const MAX_DURATION_MS = Number(process.env.RECORD_DURATION_MS ?? 25_000)
const GAMEPLAY_ONLY = process.env.GAMEPLAY_ONLY === '1' || process.env.GAMEPLAY_ONLY === 'true'

/** @type {Array<{ name: string; width: number; height: number }>} */
const ALL_FORMATS = [
  { name: '16x9', width: 1280, height: 720 },
  { name: '9x16', width: 720, height: 1280 },
]

const FORMATS =
  process.env.RECORD_FORMAT === '16x9'
    ? [ALL_FORMATS[0]]
    : process.env.RECORD_FORMAT === '9x16'
      ? [ALL_FORMATS[1]]
      : ALL_FORMATS

async function waitForPlayButton(page) {
  await page.getByRole('button', { name: 'Играть' }).waitFor({ timeout: 45_000 })
}

async function skipTutorialIfVisible(page) {
  for (let step = 0; step < 6; step += 1) {
    const dialog = page.locator('[role="dialog"]')
    if (!(await dialog.isVisible().catch(() => false))) return

    const next = dialog.getByRole('button', { name: /Далее|Понятно|Играть|Начать/ })
    if (await next.isVisible().catch(() => false)) {
      await next.click()
      await page.waitForTimeout(250)
      continue
    }
    break
  }
}

async function sleep(page, ms, remain) {
  await page.waitForTimeout(Math.min(ms, remain()))
}

async function clickNav(page, label) {
  await page.getByRole('navigation', { name: 'Разделы' }).getByRole('button', { name: label }).click()
}

async function dropOneCat(page, index) {
  const canvas = page.locator('.game-canvas__canvas')
  if (!(await canvas.isVisible().catch(() => false))) return false

  const box = await canvas.boundingBox()
  if (!box) return false

  const ratio = 0.16 + ((index * 19) % 68) / 100
  await page.mouse.click(box.x + box.width * ratio, box.y + box.height * 0.11)
  return true
}

async function startGameplay(page, remain) {
  await waitForPlayButton(page)
  await sleep(page, GAMEPLAY_ONLY ? 600 : 2200, remain)
  await page.getByRole('button', { name: 'Играть' }).click()
  await sleep(page, 500, remain)
  await skipTutorialIfVisible(page)
  await page.locator('.game-canvas__canvas').waitFor({ state: 'visible', timeout: 10_000 })
}

async function playDrops(page, remain, startIndex = 0) {
  let dropIndex = startIndex
  while (remain() > 200) {
    const dropped = await dropOneCat(page, dropIndex)
    if (!dropped) break
    dropIndex += 1
    await sleep(page, 380, remain)
  }
}

async function runGameplayOnly(page) {
  const startedAt = Date.now()
  const remain = () => Math.max(0, MAX_DURATION_MS - (Date.now() - startedAt))

  await startGameplay(page, remain)
  await sleep(page, 400, remain)
  await playDrops(page, remain)
  await sleep(page, remain(), remain)
}

async function runFullGameDemo(page) {
  const startedAt = Date.now()
  const remain = () => Math.max(0, MAX_DURATION_MS - (Date.now() - startedAt))

  await waitForPlayButton(page)
  await sleep(page, 2200, remain)

  await clickNav(page, 'Магазин')
  await sleep(page, 2000, remain)

  await clickNav(page, 'Коллекция')
  await sleep(page, 2000, remain)

  await clickNav(page, 'Задания')
  await sleep(page, 1800, remain)

  await clickNav(page, 'Домик')
  await sleep(page, 1000, remain)

  await startGameplay(page, remain)

  let dropIndex = 0
  while (remain() > 350) {
    const dropped = await dropOneCat(page, dropIndex)
    if (!dropped) break
    dropIndex += 1
    await sleep(page, 420, remain)
  }

  await sleep(page, remain(), remain)
}

async function recordFormat(browser, format) {
  const context = await browser.newContext({
    viewport: { width: format.width, height: format.height },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: format.width, height: format.height },
    },
  })

  await context.addInitScript(() => {
    try {
      const key = 'cat-merge-player'
      const raw = localStorage.getItem(key)
      const parsed = raw ? JSON.parse(raw) : {}
      parsed.tutorialCompleted = true
      localStorage.setItem(key, JSON.stringify(parsed))
    } catch {
      /* ignore */
    }
  })

  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  if (GAMEPLAY_ONLY) {
    await runGameplayOnly(page)
  } else {
    await runFullGameDemo(page)
  }

  const video = page.video()
  await context.close()

  if (!video) throw new Error(`Video was not recorded for ${format.name}`)

  const rawPath = await video.path()
  const targetPath = path.join(OUT_DIR, `gameplay-${format.name}.webm`)
  await rename(rawPath, targetPath)

  return targetPath
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })

  try {
    for (const format of FORMATS) {
      const file = await recordFormat(browser, format)
      console.log(`Recorded: ${file}`)
      console.log(
        `Format: ${format.name} (${format.width}x${format.height}), ${MAX_DURATION_MS / 1000}s, gameplayOnly=${GAMEPLAY_ONLY}`,
      )
    }
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
