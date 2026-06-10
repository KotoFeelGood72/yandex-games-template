/** Фразы комбо по множителю (×2 … ×10). */
export const COMBO_CALLOUT_PHRASES: Record<number, string> = {
  2: 'Хорошо!',
  3: 'Отлично!',
  4: 'Великолепно!',
  5: 'Потрясающе!',
  6: 'Супер!',
  7: 'Невероятно!',
  8: 'Фантастика!',
  9: 'Божественно!',
  10: 'Легенда!',
}

/** Короткий всплеск — без долгого удержания на экране. */
export const COMBO_CALLOUT_DURATION_MS = 680

/** Вертикальная позиция callout на игровом поле (доля от LOSE_LINE_Y). */
export const COMBO_CALLOUT_Y_RATIO = 0.58

export function getComboCalloutPhrase(combo: number): string | null {
  if (combo < 2) return null
  return COMBO_CALLOUT_PHRASES[combo] ?? COMBO_CALLOUT_PHRASES[10] ?? null
}
