export interface ComboCalloutStyle {
  fill: string
  glow: string
  flash: string
  fontSize: number
}

const COMBO_STYLES: Record<number, ComboCalloutStyle> = {
  2: { fill: '#fff176', glow: '#ffea00', flash: 'rgba(255, 235, 120, 0.9)', fontSize: 26 },
  3: { fill: '#ffd54f', glow: '#ffc400', flash: 'rgba(255, 213, 80, 0.92)', fontSize: 28 },
  4: { fill: '#ffca28', glow: '#ffb300', flash: 'rgba(255, 193, 50, 0.94)', fontSize: 30 },
  5: { fill: '#ffb300', glow: '#ff9100', flash: 'rgba(255, 171, 30, 0.95)', fontSize: 32 },
  6: { fill: '#ffa726', glow: '#ff6d00', flash: 'rgba(255, 152, 40, 0.96)', fontSize: 34 },
  7: { fill: '#ff9800', glow: '#ff5722', flash: 'rgba(255, 120, 20, 0.96)', fontSize: 36 },
  8: { fill: '#ff7043', glow: '#ff3d00', flash: 'rgba(255, 90, 30, 0.97)', fontSize: 38 },
  9: { fill: '#ff5722', glow: '#ff1744', flash: 'rgba(255, 60, 40, 0.98)', fontSize: 40 },
  10: { fill: '#ff3d00', glow: '#ff006e', flash: 'rgba(255, 40, 80, 1)', fontSize: 42 },
}

export function getComboCalloutStyle(combo: number): ComboCalloutStyle {
  return COMBO_STYLES[Math.min(10, Math.max(2, combo))] ?? COMBO_STYLES[10]!
}
