import type { Config } from './Config'

const GUIDE_COLORS = {
  line: 'var(--pdd-guide-color-line)',
  pattern: 'var(--pdd-guide-color-pattern)',
  auto: 'var(--pdd-guide-color-auto)',
  fixed: 'var(--pdd-guide-color-fixed)',
}

const SPACER_COLORS = {
  line: 'var(--pdd-spacer-color-line)',
  flat: 'var(--pdd-spacer-color-flat)',
  indice: 'var(--pdd-spacer-color-indice)',
}

const BOX_COLORS = {
  line: 'var(--pdd-box-color-line)',
  flat: 'var(--pdd-box-color-flat)',
  indice: 'var(--pdd-box-color-indice)',
}

const PADDER_COLOR = 'var(--pdd-padder-color)'

export const DEFAULT_CONFIG: Config = {
  base: 8,
  guide: {
    variant: 'line',
    visibility: 'hidden',
    colors: GUIDE_COLORS,
  },
  spacer: {
    variant: 'line',
    visibility: 'hidden',
    colors: SPACER_COLORS,
  },
  box: {
    visibility: 'hidden',
    colors: BOX_COLORS,
  },
  padder: {
    visibility: 'hidden',
    color: PADDER_COLOR,
  },
} as const