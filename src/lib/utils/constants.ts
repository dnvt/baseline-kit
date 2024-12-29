export const CSS_UNITS = ['px', 'rem', 'em', 'vh', 'vw', '%', 'fr'] as const
export type CSSUnit = (typeof CSS_UNITS)[number]

export const GRID = {
  DEFAULTS: {
    ALIGN: 'center',
    Z_INDEX: 0,
    BASE: 8,
    HEIGHT: '100%',
    COLUMN_WIDTH: '1fr',
    COLORS: {
      X_GRID: 'var(--grid-color-fixed)',
      Y_GRID: 'var(--grid-color-line)',
    },
    GAP: 8,
    COLUMNS: 9,
  },
  LIMITS: {
    BASE: {
      MIN: 1,
      MAX: 16,
    },
  },
  VARIANTS: {
    LINE: 'line',
    FLAT: 'flat',
  } as const,
} as const

