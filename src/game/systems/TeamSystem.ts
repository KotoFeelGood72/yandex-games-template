import type { TeamId } from '../data/mapConfig'
import { calcInventoryScore } from '../domain/scoreCalc'
import type { Player } from '../entities/Player'
import type { BotPlayer } from '../entities/BotPlayer'
import type { GhostPlayer } from '../entities/GhostPlayer'

export class TeamSystem {
  readonly localTeam: TeamId = 'blue'

  getOpponentTeam(team: TeamId): TeamId {
    return team === 'blue' ? 'pink' : 'blue'
  }

  sumTeamScore(
    players: Array<Player | BotPlayer | GhostPlayer>,
    team: TeamId,
  ): number {
    return players
      .filter((p) => p.team === team)
      .reduce((sum, p) => sum + calcInventoryScore(p.inventory), 0)
  }
}
