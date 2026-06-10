export const GRID_SIZE = 4

export type Direction = 'up' | 'down' | 'left' | 'right'

/** 0 = пустая клетка, иначе значение плитки (2, 4, 8, …) */
export type Cell = number

export type Board = Cell[][]

export interface TileView {
  id: number
  value: Cell
  row: number
  col: number
  isNew?: boolean
  isMerged?: boolean
  /** Скрыта после анимации слияния */
  pendingRemove?: boolean
}

export interface MoveResult {
  board: Board
  scoreGained: number
  moved: boolean
}
