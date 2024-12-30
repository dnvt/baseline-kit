export const COMPONENTS = {
  align: 'center',
  baseUnit: 8,
  zIndex: 0,
  colors: {
    xGrid: 'var(--grid-color-fixed)',
    yGrid: 'var(--grid-color-line)',
    spacer: 'var(--spacer-color-line)',
  },
  variants: {
    xGrid: 'flat',
    yGrid: 'line',
    spacer: 'line',
  },
  visibility: {
    xGrid: 'hidden',
    yGrid: 'hidden',
    spacer: 'hidden',
  },
} as const