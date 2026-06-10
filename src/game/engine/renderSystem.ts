import { GAME_HEIGHT, GAME_WIDTH, LOSE_LINE_Y } from '@/game/config/gameConfig'
import { getLevelDef } from '@/game/config/objectLevels'
import { getCatSprite, getCircleFrame, getGameFieldBackground } from '@/game/assets/catSprites'
import { fallEffectPlayer } from '@/game/effects/fallEffectPlayer'
import { mergeBoomPlayer } from '@/game/effects/mergeBoomPlayer'
import { hasPassedLoseLine } from '@/game/engine/loseSystem'
import type { NextObject, ScorePopup } from '@/game/types/game.types'
import type { MergeObject } from '@/game/types/physics.types'

const FIELD_TOP = '#243558'
const FIELD_BOTTOM = '#141e38'
/** Минимальная вертикальная скорость (px/кадр), при которой показывается шлейф падения */
const MIN_FALL_TRAIL_VELOCITY = 0.8

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  objects: MergeObject[],
  nextObject: NextObject | null,
  showPreview: boolean,
  scorePopups: ScorePopup[],
  loseProgress: number,
  now: number,
  showAimLine = false,
): void {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
  drawFieldBackground(ctx)

  if (loseProgress > 0) {
    ctx.fillStyle = `rgba(255, 60, 60, ${loseProgress * 0.12})`
    ctx.fillRect(0, 0, GAME_WIDTH, LOSE_LINE_Y)
  }

  for (const obj of objects) {
    if (obj.showDropTrail) {
      drawObjectFallTrail(ctx, obj)
    }
    drawObject(ctx, obj)
  }

  if (showAimLine && showPreview && nextObject) {
    const def = getLevelDef(nextObject.level)
    drawDropTrajectory(ctx, nextObject.x, nextObject.y, def.radius)
  }

  if (showPreview && nextObject) {
    drawPreview(ctx, nextObject, now)
  }

  mergeBoomPlayer.draw(ctx, now)

  for (const popup of scorePopups) {
    drawScorePopup(ctx, popup, now)
  }
}

function drawFieldBackground(ctx: CanvasRenderingContext2D): void {
  const bg = getGameFieldBackground()
  if (bg && bg.complete && bg.naturalWidth > 0) {
    ctx.drawImage(bg, 0, 0, GAME_WIDTH, GAME_HEIGHT)
    return
  }

  const bgGrad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT)
  bgGrad.addColorStop(0, FIELD_TOP)
  bgGrad.addColorStop(1, FIELD_BOTTOM)
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
}

function drawScorePopup(
  ctx: CanvasRenderingContext2D,
  popup: ScorePopup,
  now: number,
): void {
  const age = now - popup.createdAt
  const duration = 900
  if (age >= duration) return

  const t = age / duration
  const alpha = 1 - t
  const yOffset = t * 36

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.font = 'bold 16px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'
  ctx.lineWidth = 3
  ctx.strokeText(popup.text, popup.x, popup.y - yOffset)
  ctx.fillText(popup.text, popup.x, popup.y - yOffset)
  ctx.restore()
}

function drawObjectFallTrail(ctx: CanvasRenderingContext2D, obj: MergeObject): void {
  if (!hasPassedLoseLine(obj)) return

  const { x, y } = obj.body.position
  const vy = Math.max(0, obj.body.velocity.y)
  if (vy < MIN_FALL_TRAIL_VELOCITY) return

  const intensity = Math.min(1, vy / 14)
  const anchorY = y - obj.radius

  fallEffectPlayer.draw(ctx, x, anchorY, obj.radius, {
    alpha: 0.55 + intensity * 0.4,
    intensity: 0.35 + intensity * 0.65,
  })
}

interface SpriteRect {
  x: number
  y: number
  w: number
  h: number
}

/** Квадратные ассеты: кот в пузыре, низ пузыря — у нижней границы кадра */
const SPRITE_BOTTOM_INSET = 2
const SPRITE_WIDTH_INSET = 6
/** Смещение кота вниз относительно низа шара (доля радиуса) */
const SPRITE_DROP_FACTOR = 0.11
/** Обрезка по кругу пузыря — чуть меньше радиуса, чтобы не вылезало за обводку */
const SPRITE_CLIP_INSET = 1.5

function getBottomAlignedSpriteRect(sprite: HTMLImageElement, radius: number): SpriteRect {
  const fitDiameter = Math.max(16, (radius - SPRITE_WIDTH_INSET) * 2)
  const imgW = sprite.naturalWidth
  const imgH = sprite.naturalHeight
  const scale = fitDiameter / imgW
  const w = fitDiameter
  const h = imgH * scale
  const drop = radius * SPRITE_DROP_FACTOR

  return {
    x: -w / 2,
    y: radius - h - SPRITE_BOTTOM_INSET + drop,
    w,
    h,
  }
}

function clipToBubble(ctx: CanvasRenderingContext2D, radius: number): void {
  ctx.beginPath()
  ctx.arc(0, 0, Math.max(4, radius - SPRITE_CLIP_INSET), 0, Math.PI * 2)
  ctx.clip()
}

/** Пунктирная линия падения при прицеливании */
function drawDropTrajectory(
  ctx: CanvasRenderingContext2D,
  x: number,
  previewY: number,
  radius: number,
): void {
  const startY = previewY + radius + 6
  const endY = GAME_HEIGHT - 8

  ctx.save()
  ctx.beginPath()
  ctx.setLineDash([5, 7])
  ctx.lineCap = 'round'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)'
  ctx.lineWidth = 2
  ctx.moveTo(x, startY)
  ctx.lineTo(x, endY)
  ctx.stroke()
  ctx.restore()
}

function drawCatSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  level: number,
  angle: number,
  options: { alpha?: number; preview?: boolean } = {},
): void {
  const { alpha = 1, preview = false } = options
  const sprite = getCatSprite(level)
  const def = getLevelDef(level)

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.globalAlpha = alpha

  ctx.beginPath()
  ctx.arc(2, 3, radius, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'
  ctx.fill()

  if (sprite && sprite.complete && sprite.naturalWidth > 0) {
    ctx.save()
    clipToBubble(ctx, radius)
    const rect = getBottomAlignedSpriteRect(sprite, radius)
    ctx.drawImage(sprite, rect.x, rect.y, rect.w, rect.h)
    ctx.restore()
  } else {
    ctx.beginPath()
    ctx.arc(0, 0, radius, 0, Math.PI * 2)
    ctx.fillStyle = def.color
    ctx.fill()
  }

  const frame = getCircleFrame()
  const frameSize = radius * 2
  if (frame && frame.complete && frame.naturalWidth > 0) {
    ctx.drawImage(frame, -radius, -radius, frameSize, frameSize)
  } else if (!sprite || !sprite.complete || sprite.naturalWidth <= 0) {
    ctx.beginPath()
    ctx.arc(0, 0, radius, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.lineWidth = 2.5
    ctx.stroke()
  }

  ctx.restore()
}

function drawObject(ctx: CanvasRenderingContext2D, obj: MergeObject): void {
  const { x, y } = obj.body.position
  drawCatSprite(ctx, x, y, obj.radius, obj.level, obj.body.angle)
}

function drawPreview(ctx: CanvasRenderingContext2D, next: NextObject, _now: number): void {
  const def = getLevelDef(next.level)

  drawCatSprite(ctx, next.x, next.y, def.radius, next.level, next.tilt, {
    alpha: 0.94,
    preview: true,
  })
}
