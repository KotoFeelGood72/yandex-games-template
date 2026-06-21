type Listener = (...args: unknown[]) => void

class GameEventBus {
  private listeners = new Map<string, Set<Listener>>()

  on(event: string, listener: Listener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
    return () => this.off(event, listener)
  }

  off(event: string, listener: Listener): void {
    this.listeners.get(event)?.delete(listener)
  }

  emit(event: string, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach((listener) => listener(...args))
  }
}

export const gameEvents = new GameEventBus()

export const GAME_EVENTS = {
  LEVEL_UP: 'level:up',
  GAME_OVER: 'game:over',
  RESUME: 'game:resume',
  RESTART: 'game:restart',
  UPGRADE_APPLIED: 'upgrade:applied',
  EVENT_ALTAR: 'event:altar',
  SECONDARY_UPDATE: 'secondary:update',
} as const
