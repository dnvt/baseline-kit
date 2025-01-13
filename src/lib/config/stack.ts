import { COMPONENTS } from './components'
import { X_GRID } from './grids'

export const STACK = {
  baseUnit: COMPONENTS.baseUnit,
  colors: {
    line: COMPONENTS.colors.stack.line,
    flat: COMPONENTS.colors.stack.flat,
    pattern: COMPONENTS.colors.stack.pattern,
  },
  variant: 'line',
  visibility: COMPONENTS.visibility.stack,
  zIndex: COMPONENTS.zIndex,
  defaults: {
    border: true,
    align: 'start',
    justify: 'start',
    direction: 'row',
    gap: X_GRID.gap,
    columns: X_GRID.columns,
    max: {
      width: '100%',
      height: '100%',
    },
  },
} as const
