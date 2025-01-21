import type { Config } from './Config'

const GUIDE_COLORS = {
  line: 'var(--pdd-guide-color-line-theme)',
  pattern: 'var(--pdd-guide-color-pattern-theme)',
  auto: 'var(--pdd-guide-color-auto-theme)',
  fixed: 'var(--pdd-guide-color-fixed-theme)',
}

const SPACER_COLORS = {
  line: 'var(--pdd-spacer-color-line-theme)',
  flat: 'var(--pdd-spacer-color-flat-theme)',
  indice: 'var(--pdd-spacer-color-indice-theme)',
}

const BOX_COLORS = {
  line: 'var(--pdd-box-color-line-theme)',
  flat: 'var(--pdd-box-color-flat-theme)',
  indice: 'var(--pdd-box-color-indice-theme)',
}

const PADDER_COLOR = 'var(--pdd-padder-color-theme)'

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