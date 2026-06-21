import type { TeamId } from '../data/mapConfig'
import { calcInventoryScore } from '../domain/scoreCalc'
import type { Player } from '../entities/Player'
import type { BotPlayer } from '../entities/BotPlayer'
import type { GhostPlayer } from '../entities/GhostPlayer'

export interface TeamScores {
  blue: number
  pink: number
}

export class ScoreSystem {
  compute(
    participants: Array<Player | BotPlayer | GhostPlayer>,
  ): TeamScores {
    let blue = 0
    let pink = 0

    for (const p of participants) {
      const score = calcInventoryScore(p.inventory)
      if (p.team === 'blue') blue += score
      else pink += score
    }

    return { blue, pink }
  }

  winner(scores: TeamScores): TeamId | 'draw' {
    if (scores.blue > scores.pink) return 'blue'
    if (scores.pink > scores.blue) return 'pink'
    return 'draw'
  }
}
