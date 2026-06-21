export interface SynergyDefinition {
  id: string
  title: string
  description: string
  requiredTags: string[]
}

export const SYNERGIES: SynergyDefinition[] = [
  { id: 'fire_explosion', title: 'Огненный взрыв', description: 'Взрывы поджигают врагов', requiredTags: ['fire', 'explosion'] },
  { id: 'ice_crit', title: 'Ледяные шипы', description: 'Криты создают осколки', requiredTags: ['ice', 'crit'] },
  { id: 'poison_firerate', title: 'Токсичный шторм', description: 'Яд распространяется между врагами', requiredTags: ['poison', 'firerate'] },
  { id: 'turret_lightning', title: 'Штормовая турель', description: 'Атаки перескакивают между врагами', requiredTags: ['turret', 'lightning'] },
  { id: 'spear_crit', title: 'Кровавый выпад', description: 'Крит создаёт дополнительный выпад', requiredTags: ['spear', 'crit'] },
]

export function detectSynergies(ownedTags: Set<string>): SynergyDefinition[] {
  return SYNERGIES.filter((synergy) =>
    synergy.requiredTags.every((tag) => ownedTags.has(tag)),
  )
}
