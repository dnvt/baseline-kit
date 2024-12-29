export const GRID = {
  defaults: {
    align: 'center',
    baseUnit: 8,
    colors: {
      xGrid: 'var(--grid-color-fixed)',
      yGrid: 'var(--grid-color-line)',
    },
    columns: 9,
    columnWidth: '1fr',
    gap: 8,
    height: '100%',
    zIndex: 0,
  },
  limits: {
    base: {
      min: 1,
      max: 16,
    },
  },
  variants: {
    flat: 'flat',
    line: 'line',
  } as const,
} as const

