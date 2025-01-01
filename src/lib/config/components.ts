export const COMPONENTS = {
  baseUnit: 8,
  zIndex: 0,
  colors: {
    xGrid: 'var(--padd-grid-color-fixed)',
    yGrid: 'var(--padd-grid-color-line)',
    spacer: {
      line: 'var(--padd-spacer-line)',
      flat: 'var(--padd-spacer-flat)',
      indice: 'var(--padd-spacer-color-indice)',
    },
  },
  variants: {
    xGrid: 'line',
    yGrid: 'line',
    spacer: 'line',
  },
  visibility: {
    xGrid: 'hidden',
    yGrid: 'hidden',
    spacer: 'hidden',
  },
} as const
