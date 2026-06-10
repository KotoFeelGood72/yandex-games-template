import Matter from 'matter-js'

import {
  COMBO_MAX,
  COMBO_WINDOW_MS,
  CONTINUE_MERGE_TARGET_RATIO,
  CONTINUE_PROTECTION_MS,
  DROP_CLEAR_TIMEOUT_MS,
  DROP_INITIAL_VELOCITY,
  DROP_Y,
  GAME_HEIGHT,
  GAME_WIDTH,
  LOSE_LINE_Y,
  MAX_ANGULAR_VELOCITY,
  MAX_VELOCITY,
  NEXT_PREVIEW_DELAY_MS,
  PREVIEW_BOB_AMPLITUDE,
  PREVIEW_BOB_SPEED,
  PREVIEW_CLEARANCE,
  PREVIEW_FOLLOW_LAMBDA,
} from '@/game/config/gameConfig'
import { balanceConfig } from '@/game/config/balanceConfig'
import { createPhysicsWorld } from '@/game/engine/createPhysicsWorld'
import { canMerge, mergeObjects, type MergeCallbacks } from '@/game/engine/mergeSystem'
import { checkLoseCondition, getLoseProgress, type LoseState } from '@/game/engine/loseSystem'
import { findNearestSameLevelObject, findObjectAtPoint } from '@/game/engine/boosterSystem'
import { reduceObjectsByMerging } from '@/game/engine/continueMergeSystem'
import { getLevelDef } from '@/game/config/objectLevels'
import { mergeBoomPlayer } from '@/game/effects/mergeBoomPlayer'
import { createMergeObject, resetObjectIdCounter } from '@/game/engine/objectFactory'
import { renderFrame } from '@/game/engine/renderSystem'
import { alignFieldToFloor, wakeAllObjects, zeroAllVelocities, resetObjectsAge } from '@/game/engine/stabilizeSystem'
import type { BoosterMode, NextObject, ScorePopup } from '@/game/types/game.types'
import type { MergeObject } from '@/game/types/physics.types'
import { clamp } from '@/shared/utils/clamp'
import { getRandomSpawnLevel } from '@/shared/utils/random'
import { getComboCalloutPhrase } from '@/game/config/comboCallouts'

export interface GameEngineCallbacks {
  onScore: (points: number, comboMultiplier: number) => void
  onCoins: (amount: number) => void
  onGameOver: () => void
  onVictory: (level: number) => void
  onLevelUnlocked: (level: number, comboMultiplier: number) => void
  onBoosterFail: (message: string) => void
  onBoosterUsed: () => void
  onComboCallout: (callout: { text: string; combo: number; createdAt: number }) => void
}

export class GameEngine {
  private engine: Matter.Engine
  private world: Matter.World
  private objects: MergeObject[] = []
  private bodyObjectMap = new Map<number, MergeObject>()
  private nextObject: NextObject | null = null
  private scorePopups: ScorePopup[] = []
  private effectIdCounter = 0
  private popupIdCounter = 0
  private protectionUntil = 0

  private isRunning = false
  private isPhysicsPaused = false
  private canDrop = true
  private isDragging = false
  private showPreview = false

  private loseState: LoseState = { loseTimerStartedAt: null }
  private combo = 1
  private lastMergeAt = 0

  private maxUnlockedLevel = 1
  /** Уровни, созданные слиянием в текущей партии — только их можно сбрасывать сверху */
  private sessionMergedLevels = new Set<number>()
  private boosterMode: BoosterMode = null

  private animationFrameId: number | null = null
  private lastTime = 0
  private lastPointerX = GAME_WIDTH / 2
  private awaitingDropClear: MergeObject | null = null
  private awaitingDropSince = 0
  private dropCleared = false
  private nextPreviewReadyAt = 0
  private suppressCollisions = false

  private readonly onCollisionEvent = (event: Matter.IEventCollision<Matter.Engine>): void => {
    for (const pair of event.pairs) {
      this.handleCollision(pair.bodyA, pair.bodyB)
    }
  }

  constructor(private callbacks: GameEngineCallbacks) {
    const { engine, world } = createPhysicsWorld()
    this.engine = engine
    this.world = world
    this.setupCollisions()
  }

  setMaxUnlockedLevel(level: number): void {
    this.maxUnlockedLevel = level
  }

  setBoosterMode(mode: BoosterMode): void {
    this.boosterMode = mode
  }

  getObjects(): readonly MergeObject[] {
    return this.objects
  }

  getNextObject(): NextObject | null {
    return this.nextObject
  }

  getLoseProgress(now: number): number {
    return getLoseProgress(this.loseState, now)
  }

  start(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.resetWorld()
    this.isRunning = true
    this.isPhysicsPaused = false
    this.lastTime = performance.now()
    this.loop(this.lastTime)
  }

  stop(): void {
    this.isRunning = false
    mergeBoomPlayer.clear()
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  pausePhysics(): void {
    this.isPhysicsPaused = true
  }

  resumePhysics(): void {
    this.isPhysicsPaused = false
    this.lastTime = performance.now()
    wakeAllObjects(this.objects)
    this.ensurePhysicsLoop()
  }

  private ensurePhysicsLoop(): void {
    if (!this.isRunning || this.animationFrameId !== null) return
    this.lastTime = performance.now()
    this.loop(this.lastTime)
  }

  resetWorld(): void {
    for (const obj of [...this.objects]) {
      this.removeObject(obj)
    }
    this.objects = []
    this.bodyObjectMap.clear()
    mergeBoomPlayer.clear()
    this.sessionMergedLevels.clear()
    this.scorePopups = []
    this.protectionUntil = 0
    this.loseState = { loseTimerStartedAt: null }
    this.combo = 1
    this.lastMergeAt = 0
    this.canDrop = true
    this.isDragging = false
    this.showPreview = false
    this.lastPointerX = GAME_WIDTH / 2
    this.awaitingDropClear = null
    this.awaitingDropSince = 0
    this.dropCleared = false
    this.nextPreviewReadyAt = 0
    resetObjectIdCounter()
    this.generateNextObject()
    this.showPreview = true
  }

  continueAfterGameOver(): void {
    this.removeObjectsAboveLoseLine()

    const targetCount = Math.max(
      1,
      Math.ceil(this.objects.length * CONTINUE_MERGE_TARGET_RATIO),
    )
    this.suppressCollisions = true
    try {
      reduceObjectsByMerging(
        () => this.objects,
        targetCount,
        (a, b) => this.performSilentMerge(a, b),
        (obj) => this.removeObject(obj),
      )
    } finally {
      this.suppressCollisions = false
    }

    const snapshot = this.objects.map((obj) => ({
      level: obj.level,
      x: obj.body.position.x,
      y: obj.body.position.y,
    }))

    this.restartPhysicsWorld()

    for (const item of snapshot) {
      this.spawnObject(item.level, item.x, item.y)
    }
    alignFieldToFloor(this.objects)
    zeroAllVelocities(this.objects)
    resetObjectsAge(this.objects)

    this.loseState = { loseTimerStartedAt: null }
    this.protectionUntil = Date.now() + CONTINUE_PROTECTION_MS
    this.isDragging = false
    this.awaitingDropClear = null
    this.dropCleared = false
    this.nextPreviewReadyAt = 0
    this.canDrop = true
    this.generateNextObject()
    this.showPreview = true
    this.aimPreview(this.lastPointerX)
  }

  /** Новый Matter.Engine — чистая физика без «битого» состояния после паузы/рекламы. */
  private restartPhysicsWorld(): void {
    this.teardownCollisions()
    Matter.Engine.clear(this.engine)

    const { engine, world } = createPhysicsWorld()
    this.engine = engine
    this.world = world
    this.objects = []
    this.bodyObjectMap.clear()
    this.setupCollisions()
  }

  private removeObjectsAboveLoseLine(): void {
    const toRemove = this.objects.filter(
      (obj) => obj.body.position.y - obj.radius < LOSE_LINE_Y,
    )
    for (const obj of toRemove) {
      this.removeObject(obj)
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const now = Date.now()
    this.scorePopups = this.scorePopups.filter((p) => now - p.createdAt < 900)
    renderFrame(
      ctx,
      this.objects,
      this.nextObject,
      this.showPreview,
      this.scorePopups,
      this.getLoseProgress(now),
      now,
      this.isDragging && !this.boosterMode,
    )
  }

  handlePointerDown(x: number, y: number): void {
    if (this.isPhysicsPaused || !this.canDrop) return

    if (this.boosterMode) {
      this.handleBoosterClick(x, y)
      return
    }

    if (!this.nextObject) return
    this.isDragging = true
    this.showPreview = true
    this.aimPreview(x)
  }

  handlePointerMove(x: number): void {
    this.aimPreview(x)
  }

  private aimPreview(x: number): void {
    this.lastPointerX = x
    if (this.isPhysicsPaused || this.boosterMode || !this.nextObject || !this.showPreview) return
    const radius = getLevelDef(this.nextObject.level).radius
    this.nextObject.targetX = clamp(x, radius, GAME_WIDTH - radius)
  }

  private updatePreviewMotion(deltaMs: number, timeSec: number): void {
    if (!this.nextObject || !this.showPreview) return

    const preview = this.nextObject
    const dt = Math.max(deltaMs / 1000, 0.001)
    const follow = 1 - Math.exp(-PREVIEW_FOLLOW_LAMBDA * dt)
    const prevX = preview.x
    preview.x += (preview.targetX - preview.x) * follow
    preview.velocityX = (preview.x - prevX) / dt
    preview.tilt = 0
    preview.y = DROP_Y + Math.sin(timeSec * PREVIEW_BOB_SPEED) * PREVIEW_BOB_AMPLITUDE
  }

  handlePointerUp(): void {
    if (!this.isDragging) return

    if (!this.nextObject || !this.canDrop) {
      this.isDragging = false
      return
    }

    const level = this.nextObject.level
    const x = this.nextObject.x
    const dropped = this.spawnObject(level, x, DROP_Y)
    this.applyPlayerDropImpulse(dropped)

    this.isDragging = false
    this.nextObject = null
    this.showPreview = false
    this.canDrop = false
    this.awaitingDropClear = dropped
    this.awaitingDropSince = Date.now()
    this.dropCleared = false
    this.nextPreviewReadyAt = Date.now() + NEXT_PREVIEW_DELAY_MS
  }

  private handleBoosterClick(x: number, y: number): void {
    const target = findObjectAtPoint(this.objects, x, y)
    if (!target) return

    if (this.boosterMode === 'bomb') {
      this.removeObject(target)
      this.boosterMode = null
      this.callbacks.onBoosterUsed()
      return
    }

    if (this.boosterMode === 'cookie') {
      const { x, y } = target.body.position
      this.removeObject(target)
      if (target.level > 1) {
        const smaller = this.spawnObject(target.level - 1, x, y)
        Matter.Body.setVelocity(smaller.body, { x: 0, y: -2 })
      }
      this.boosterMode = null
      this.callbacks.onBoosterUsed()
      return
    }

    if (this.boosterMode === 'rainbow') {
      const nearest = findNearestSameLevelObject(target, this.objects)
      if (!nearest) {
        this.callbacks.onBoosterFail('Нет подходящей пары')
        return
      }
      this.boosterMode = null
      this.callbacks.onBoosterUsed()
      this.performMerge(target, nearest)
    }
  }

  private setupCollisions(): void {
    Matter.Events.on(this.engine, 'collisionStart', this.onCollisionEvent)
    Matter.Events.on(this.engine, 'collisionActive', this.onCollisionEvent)
  }

  private teardownCollisions(): void {
    Matter.Events.off(this.engine, 'collisionStart', this.onCollisionEvent)
    Matter.Events.off(this.engine, 'collisionActive', this.onCollisionEvent)
  }

  private handleCollision(bodyA: Matter.Body, bodyB: Matter.Body): void {
    if (this.suppressCollisions) return
    const objectA = this.bodyObjectMap.get(bodyA.id)
    const objectB = this.bodyObjectMap.get(bodyB.id)
    if (!objectA || !objectB) return
    if (!canMerge(objectA, objectB)) return
    this.performMerge(objectA, objectB)
  }

  private performMerge(objectA: MergeObject, objectB: MergeObject): void {
    const now = Date.now()
    if (now - this.lastMergeAt < COMBO_WINDOW_MS) {
      this.combo = Math.min(this.combo + 1, COMBO_MAX)
    } else {
      this.combo = 1
    }
    this.lastMergeAt = now

    const phrase = getComboCalloutPhrase(this.combo)
    if (phrase) {
      this.callbacks.onComboCallout({ text: phrase, combo: this.combo, createdAt: now })
    }

    const mergeCallbacks: MergeCallbacks = {
      onScore: (points, multiplier) => {
        const total = Math.round(points * multiplier * balanceConfig.scoreMultiplier)
        this.callbacks.onScore(total, multiplier)
        this.addScorePopup(
          (objectA.body.position.x + objectB.body.position.x) / 2,
          (objectA.body.position.y + objectB.body.position.y) / 2,
          multiplier > 1 ? `+${total} x${multiplier}` : `+${total}`,
        )
      },
      onCoins: (amount) => this.callbacks.onCoins(amount),
      onMergeEffect: (x, y, level) => {
        const id = ++this.effectIdCounter
        mergeBoomPlayer.spawn(id, x, y, getLevelDef(level).radius)
      },
      onLevelUnlocked: (level) => {
        this.sessionMergedLevels.add(level)
        this.callbacks.onLevelUnlocked(level, this.combo)
      },
      onVictory: (level) => this.callbacks.onVictory(level),
    }

    mergeObjects(
      objectA,
      objectB,
      this.objects,
      (level, x, y) => this.spawnObject(level, x, y),
      (obj) => this.removeObject(obj),
      mergeCallbacks,
      this.combo,
    )
  }

  /** Автослияние после continue — без blast, pop вверх и игровых колбэков. */
  private performSilentMerge(objectA: MergeObject, objectB: MergeObject): void {
    mergeObjects(
      objectA,
      objectB,
      this.objects,
      (level, x, y) => this.spawnObject(level, x, y),
      (obj) => this.removeObject(obj),
      {
        onScore: () => {},
        onCoins: () => {},
        onMergeEffect: () => {},
        onLevelUnlocked: () => {},
        onVictory: () => {},
      },
      1,
      { silent: true },
    )
  }

  spawnObject(level: number, x: number, y: number): MergeObject {
    const obj = createMergeObject(level, x, y)
    Matter.World.add(this.world, obj.body)
    this.objects.push(obj)
    this.bodyObjectMap.set(obj.body.id, obj)
    return obj
  }

  /** DEV: быстро наполнить поле кучей для тестов (continue, game over). */
  fillFieldForTest(): void {
    const count = 22
    const maxLevel = Math.min(6, Math.max(3, this.maxUnlockedLevel))

    for (let i = 0; i < count; i++) {
      const level = (i % maxLevel) + 1
      const col = i % 5
      const row = Math.floor(i / 5)
      const x = GAME_WIDTH / 2 + (col - 2) * 34 + (row % 2 === 0 ? 0 : 14)
      const y = GAME_HEIGHT - 58 - row * 28
      this.spawnObject(level, x, y)
    }

    alignFieldToFloor(this.objects)
    this.raiseFieldNearLoseLine()
    zeroAllVelocities(this.objects)

    const agedAt = Date.now() - 2000
    resetObjectsAge(this.objects, agedAt)

    this.loseState = { loseTimerStartedAt: null }
    this.protectionUntil = 0
    this.awaitingDropClear = null
    this.awaitingDropSince = 0
    this.dropCleared = false
    this.nextPreviewReadyAt = 0
    this.canDrop = true
    this.isDragging = false
    if (!this.nextObject) {
      this.generateNextObject()
      this.showPreview = true
    }
    this.aimPreview(this.lastPointerX)
  }

  private raiseFieldNearLoseLine(): void {
    if (this.objects.length === 0) return

    const targetTop = LOSE_LINE_Y - 6

    for (let step = 0; step < 48; step++) {
      let highestTop = Infinity
      for (const obj of this.objects) {
        highestTop = Math.min(highestTop, obj.body.position.y - obj.radius)
      }
      if (highestTop <= targetTop) break

      const delta = targetTop - highestTop
      for (const obj of this.objects) {
        Matter.Body.setPosition(obj.body, {
          x: obj.body.position.x,
          y: obj.body.position.y + delta,
        })
      }
    }
  }

  private applyPlayerDropImpulse(obj: MergeObject): void {
    obj.showDropTrail = true
    const carryX = this.nextObject?.velocityX ?? 0
    Matter.Body.setVelocity(obj.body, {
      x: clamp(carryX * 0.15, -2.5, 2.5),
      y: DROP_INITIAL_VELOCITY,
    })
  }

  private updateDropTrails(): void {
    for (const obj of this.objects) {
      if (!obj.showDropTrail) continue
      const vy = obj.body.velocity.y
      const slowEnough = vy < 1.2 && obj.body.position.y > DROP_Y + obj.radius + PREVIEW_CLEARANCE
      if (slowEnough || Date.now() - obj.createdAt > 1200) {
        obj.showDropTrail = false
      }
    }
  }

  private checkDropClearance(): void {
    if (!this.awaitingDropClear && !this.dropCleared) return
    if (this.nextObject) return

    if (this.awaitingDropClear) {
      const obj = this.awaitingDropClear
      const stillOnField = this.objects.some((o) => o.id === obj.id)

      if (stillOnField) {
        const threshold = DROP_Y + obj.radius + PREVIEW_CLEARANCE
        if (obj.body.position.y >= threshold) {
          this.dropCleared = true
        } else if (Date.now() - this.awaitingDropSince >= DROP_CLEAR_TIMEOUT_MS) {
          this.dropCleared = true
        }
      } else {
        this.dropCleared = true
      }
    }

    if (this.dropCleared && Date.now() >= this.nextPreviewReadyAt) {
      this.awaitingDropClear = null
      this.awaitingDropSince = 0
      this.dropCleared = false
      this.nextPreviewReadyAt = 0
      this.revealNextPreview()
    }
  }

  private revealNextPreview(): void {
    if (this.nextObject) return
    this.generateNextObject()
    this.showPreview = true
    this.canDrop = true
    this.aimPreview(this.lastPointerX)
  }

  private removeObject(object: MergeObject): void {
    Matter.World.remove(this.world, object.body)
    this.bodyObjectMap.delete(object.body.id)
    this.objects = this.objects.filter((o) => o.id !== object.id)
  }

  private addScorePopup(x: number, y: number, text: string): void {
    this.scorePopups.push({
      id: ++this.popupIdCounter,
      x,
      y,
      text,
      createdAt: Date.now(),
    })
  }

  private getFieldMaxLevel(): number {
    if (this.objects.length === 0) return 1
    return Math.max(...this.objects.map((o) => o.level))
  }

  private getFieldLevelCounts(): Record<number, number> {
    const counts: Record<number, number> = {}
    for (const obj of this.objects) {
      counts[obj.level] = (counts[obj.level] ?? 0) + 1
    }
    return counts
  }

  private generateNextObject(): void {
    const level = getRandomSpawnLevel(
      this.maxUnlockedLevel,
      this.getFieldMaxLevel(),
      this.sessionMergedLevels,
      this.getFieldLevelCounts(),
    )
    const radius = getLevelDef(level).radius
    const spawnX = clamp(this.lastPointerX, radius, GAME_WIDTH - radius)
    this.nextObject = {
      level,
      x: spawnX,
      targetX: spawnX,
      y: DROP_Y,
      tilt: 0,
      velocityX: 0,
    }
  }

  private isObjectSupported(obj: MergeObject): boolean {
    const floorY = GAME_HEIGHT - obj.radius - 4
    if (obj.body.position.y >= floorY) return true

    for (const other of this.objects) {
      if (other.id === obj.id) continue
      if (other.body.position.y <= obj.body.position.y) continue

      const dx = Math.abs(other.body.position.x - obj.body.position.x)
      const touchX = obj.radius + other.radius - 8
      if (dx >= touchX) continue

      const gapY = other.body.position.y - obj.body.position.y
      if (gapY > 0 && gapY <= obj.radius + other.radius + 6) return true
    }

    return false
  }

  private applyContinueProtection(): void {
    if (Date.now() >= this.protectionUntil) return

    for (const obj of this.objects) {
      const body = obj.body
      const { x: vx, y: vy } = body.velocity
      if (vy >= 0) continue

      Matter.Body.setVelocity(body, { x: vx * 0.85, y: 0 })
    }
  }

  private wakeUnsupportedObjects(): void {
    for (const obj of this.objects) {
      const body = obj.body
      if (body.isSleeping || this.isObjectSupported(obj)) continue

      const speed = Math.hypot(body.velocity.x, body.velocity.y)
      if (speed > 0.35) continue

      Matter.Sleeping.set(body, false)
      Matter.Body.setVelocity(body, {
        x: body.velocity.x,
        y: Math.max(body.velocity.y, 1.4),
      })
    }
  }

  private checkProximityMerges(): void {
    if (this.suppressCollisions || !balanceConfig.mergeProximityCheck) return

    const touchFactor = balanceConfig.mergeTouchFactor
    for (let i = 0; i < this.objects.length; i++) {
      for (let j = i + 1; j < this.objects.length; j++) {
        const objectA = this.objects[i]!
        const objectB = this.objects[j]!
        if (!canMerge(objectA, objectB)) continue

        const dx = objectA.body.position.x - objectB.body.position.x
        const dy = objectA.body.position.y - objectB.body.position.y
        const dist = Math.hypot(dx, dy)
        const touchDist = (objectA.radius + objectB.radius) * touchFactor

        if (dist <= touchDist) {
          this.performMerge(objectA, objectB)
          return
        }
      }
    }
  }

  private limitObjectVelocities(): void {
    for (const obj of this.objects) {
      const body = obj.body
      let { x: vx, y: vy } = body.velocity

      if (Math.abs(vy) > MAX_VELOCITY) {
        vy = Math.sign(vy) * MAX_VELOCITY
      }
      if (Math.abs(vx) > MAX_VELOCITY) {
        vx = Math.sign(vx) * MAX_VELOCITY
      }
      Matter.Body.setVelocity(body, { x: vx, y: vy })

      const av = body.angularVelocity
      if (Math.abs(av) > MAX_ANGULAR_VELOCITY) {
        Matter.Body.setAngularVelocity(
          body,
          Math.max(-MAX_ANGULAR_VELOCITY, Math.min(MAX_ANGULAR_VELOCITY, av)),
        )
      }
    }
  }

  private loop = (time: number): void => {
    if (!this.isRunning) return

    this.animationFrameId = requestAnimationFrame(this.loop)

    try {
      const delta = Math.min(time - this.lastTime, 1000 / 60)
      this.lastTime = time
      this.updatePreviewMotion(delta, time / 1000)

      if (!this.isPhysicsPaused) {
        Matter.Engine.update(this.engine, delta)
        this.applyContinueProtection()
        this.wakeUnsupportedObjects()
        this.limitObjectVelocities()
        this.checkProximityMerges()
        this.updateDropTrails()
        this.checkDropClearance()

        const now = Date.now()
        const loseResult = checkLoseCondition(
          this.objects,
          this.loseState,
          now,
          this.protectionUntil,
        )
        this.loseState = loseResult.state
        if (loseResult.shouldLose) {
          this.isPhysicsPaused = true
          this.callbacks.onGameOver()
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[GameEngine] physics loop error', error)
      }
    }
  }
}
