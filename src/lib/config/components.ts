export const COMPONENTS = {
  baseUnit: 8,
  zIndex: 0,
  colors: {
    box: 'var(--box-color)',
    XGrid:
      'var(--padd-grid-color-fixed)',
    YGrid:
      'var(--padd-grid-color-line)',
    spacer:
      {
        line: 'var(--padd-spacer-line)',
        flat:
          'var(--padd-spacer-flat)',
        indice:
          'var(--padd-spacer-color-indice)',
      },
    stack: {
      line: 'var(--stack-color-line)',
      flat:
        'var(--stack-color-flat)',
      pattern:
        'var(--stack-color-pattern)',
    },
  },
  variants: {
    XGrid: 'line',
    YGrid:
      'line',
    spacer:
      'line',
  },
  visibility: {
    XGrid: 'hidden',
    YGrid:
      'hidden',
    spacer:
      'hidden',
    stack:
      'hidden',
  },
} as const
