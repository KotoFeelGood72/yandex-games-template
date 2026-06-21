import { NEON_PER_SUSHI } from './matchConfig'

export const TRADER_TEXTURE_KEY = 'trader-glow'
export const TRADER_DISPLAY_SIZE = 56

export interface ExchangeOffer {
  neonCost: number
  sushiGain: number
}

export const DEFAULT_EXCHANGE: ExchangeOffer = {
  neonCost: NEON_PER_SUSHI,
  sushiGain: 1,
}
