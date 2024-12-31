export const COMPONENTS = {
  baseUnit: 8,
  zIndex: 0,
  colors: {
    xGrid: 'var(--grid-color-fixed)',
    yGrid: 'var(--grid-color-line)',
    spacer: 'var(--spacer-color)',
  },
  variants: {
    xGrid: 'fixed',
    yGrid: 'line',
    spacer: 'line',
  },
  visibility: {
    xGrid: 'hidden',
    yGrid: 'hidden',
    spacer: 'hidden',
  },
} as const