export const COMPONENTS = {
  baseUnit: 8,
  zIndex: 0,
  colors: {
    xGrid: 'var(--padd-grid-color-fixed)',
    yGrid: 'var(--padd-grid-color-line)',
    spacer: 'var(--spacer-color)',
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