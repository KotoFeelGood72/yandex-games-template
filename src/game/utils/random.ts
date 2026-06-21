export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1))
}

export function pickRandom<T>(items: readonly T[], count: number): T[] {
  const pool = [...items]
  const result: T[] = []

  for (let i = 0; i < count && pool.length > 0; i++) {
    const index = randomInt(0, pool.length - 1)
    result.push(pool.splice(index, 1)[0]!)
  }

  return result
}

export function pickWeighted<T extends { weight: number }>(items: readonly T[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0)
  let roll = Math.random() * total

  for (const item of items) {
    roll -= item.weight
    if (roll <= 0) return item
  }

  return items[items.length - 1]!
}
