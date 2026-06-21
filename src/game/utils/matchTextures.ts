import Phaser from 'phaser'

/** Процедурные текстуры для Neon Stick Hunt */
export function createMatchTextures(scene: Phaser.Scene): void {
  createStickTexture(scene, 'stick-neon', '#00f5ff', '#0088aa')
  createStickTexture(scene, 'stick-sushi', '#ff44cc', '#aa2288')
  createStickTexture(scene, 'stick-golden', '#ffd54a', '#cc9900')
}

function createStickTexture(
  scene: Phaser.Scene,
  key: string,
  fill: string,
  stroke: string,
): void {
  if (scene.textures.exists(key)) scene.textures.remove(key)

  const size = 32
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = fill
  ctx.strokeStyle = stroke
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(10, 4, 12, 24, 3)
  ctx.fill()
  ctx.stroke()

  ctx.globalAlpha = 0.5
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(13, 8, 4, 8)

  scene.textures.addCanvas(key, canvas)
}
