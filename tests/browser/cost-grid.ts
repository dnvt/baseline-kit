import { REM_GRID_BOXES, REM_GRID_WORDS } from './rem-grid'

/**
 * The `?cost=rem|px` fixture (A9), shared by the React and Remix entries:
 * 100 Boxes of rem-sized text with an off-grid trailer (the `?remgrid` Box
 * mix, cycled), under a `0.5rem` base or an 8px base as the control, plus a
 * Box with 45px of content that doesn't scale with the root, which must still
 * reach the new grid when only the base changes.
 */
export const COST_BOX_COUNT = 100

export const COST_WORDS = REM_GRID_WORDS.slice(0, 9)

export const costBox = (index: number) =>
  REM_GRID_BOXES[index % REM_GRID_BOXES.length]

export const COST_CSS = '[data-cost-grid] [data-cost] { margin: 0; }'
