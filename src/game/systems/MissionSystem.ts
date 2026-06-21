import { MISSIONS, type MissionDefinition, type MissionTrack } from '../data/missionsConfig'

export interface SessionMissionStats {
  kills: number
  gold: number
  surviveSeconds: number
  bosses: number
}

export interface MissionViewState {
  id: string
  title: string
  current: number
  target: number
  completed: boolean
}

export class MissionSystem {
  private session: SessionMissionStats = {
    kills: 0,
    gold: 0,
    surviveSeconds: 0,
    bosses: 0,
  }

  resetSession(): void {
    this.session = { kills: 0, gold: 0, surviveSeconds: 0, bosses: 0 }
  }

  addKill(goldReward = 1): void {
    this.session.kills += 1
    this.session.gold += goldReward
  }

  addBossKill(): void {
    this.session.bosses += 1
    this.session.gold += 10
  }

  addSurviveSeconds(seconds: number): void {
    this.session.surviveSeconds += seconds
  }

  getSessionStats(): SessionMissionStats {
    return { ...this.session }
  }

  buildView(storedProgress: Record<string, number>, completed: string[]): MissionViewState[] {
    return MISSIONS.map((mission) => {
      const stored = storedProgress[mission.id] ?? 0
      const sessionValue = this.getTrackValue(mission.track)
      const current = Math.min(mission.target, stored + sessionValue)
      return {
        id: mission.id,
        title: mission.title,
        current,
        target: mission.target,
        completed: completed.includes(mission.id) || current >= mission.target,
      }
    })
  }

  applySessionToProgress(storedProgress: Record<string, number>): Record<string, number> {
    const next = { ...storedProgress }

    for (const mission of MISSIONS) {
      const value = (next[mission.id] ?? 0) + this.getTrackValue(mission.track)
      next[mission.id] = value
    }

    return next
  }

  detectNewlyCompleted(
    before: Record<string, number>,
    after: Record<string, number>,
    alreadyCompleted: string[],
  ): string[] {
    const fresh: string[] = []

    for (const mission of MISSIONS) {
      if (alreadyCompleted.includes(mission.id)) continue
      const was = before[mission.id] ?? 0
      const now = after[mission.id] ?? 0
      if (was < mission.target && now >= mission.target) {
        fresh.push(mission.id)
      }
    }

    return fresh
  }

  private getTrackValue(track: MissionTrack): number {
    switch (track) {
      case 'kills':
        return this.session.kills
      case 'gold':
        return this.session.gold
      case 'survive':
        return this.session.surviveSeconds
      case 'bosses':
        return this.session.bosses
    }
  }
}

export type { MissionDefinition }
