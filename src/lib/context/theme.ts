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
  guide: {
    variant: 'fixed',
    columns: 12,
    gap: 16,
    maxWidth: '1200px',
    color: 'hsla(220, 70%, 50%, 0.75)',
    visibility: 'visible',
  },
  baseline: {
    variant: 'line',
    height: '100%',
    baseUnit: 8,
    color: 'hsla(220, 70%, 50%, 0.3)',
    visibility: 'visible',
  },
  spacer: {
    colors: {
      line: 'hsla(220, 70%, 50%, 0.75)',
      flat: 'hsla(220, 70%, 50%, 0.3)',
      indice: 'hsla(220, 70%, 50%, 1)',
    },
    variant: ROOT.variants.line,
    visibility: ROOT.visibility.hidden,
  },
  padder: {
    color: 'var(--padder-color)',
    variant: ROOT.variants.flat,
    visibility: ROOT.visibility.hidden,
  },
  box: {
    color: 'var(--box-color)',
    visibility: ROOT.visibility.hidden,
  },
  stack: {
    color: 'var(--stack-color)',
    direction: 'vertical' as const,
    gap: 16,
    visibility: ROOT.visibility.hidden,
  },
  layout: {
    color: 'var(--layout-color)',
    columns: 12,
    gap: 16,
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
  }), {} as ComponentsConfig),
} as const

// Theme types
type ComponentsConfig = {
  [K in keyof typeof COMPONENTS]: typeof COMPONENTS[K] & {
  baseUnit: number
  zIndex: number
}
}

export type Theme = typeof THEME
export type ThemeComponents = typeof THEME.components
export type ComponentKey = keyof typeof COMPONENTS
export type Visibility = keyof typeof ROOT.visibility
export type Variant = keyof typeof ROOT.variants
