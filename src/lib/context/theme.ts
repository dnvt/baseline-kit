export const ROOT = {
  baseUnit: 8,
  zIndex: 0,
  variants: {
    flat: 'flat',
    line: 'line',
  },
  visibility: {
    visible: 'visible',
    hidden: 'hidden',
    none: 'none',
  },
} as const

export const COMPONENTS = {
  box: {
    color: 'var(--box-color)',
    visibility: ROOT.visibility.hidden,
  },
  padder: {
    color: 'var(--padder-color)',
    variant: ROOT.variants.flat,
    visibility: ROOT.visibility.hidden,
  },
  spacer: {
    colors: {
      [ROOT.variants.line]: 'var(--spacer-color-line)',
      [ROOT.variants.flat]: 'var(--spacer-color-flat)',
      indice: 'var(--spacer-color-indice)',
    },
    variant: ROOT.variants.line,
    visibility: ROOT.visibility.hidden,
  },
} as const

export const THEME = {
  ...ROOT,
  components: Object.entries(COMPONENTS).reduce((acc, [key, config]) => ({
    ...acc,
    [key]: {
      baseUnit: ROOT.baseUnit,
      zIndex: ROOT.zIndex,
      ...config,
    },
  }), {}),
} as const

// Theme types
export type Theme = typeof THEME
export type ThemeComponents = typeof THEME.components
export type ComponentKeys = keyof ThemeComponents
export type Visibility = keyof typeof ROOT.visibility
