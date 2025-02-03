import type { Config } from './Config'

const GUIDE_COLORS = {
  line: 'var(--pdd-guide-color-line-theme)',
  pattern: 'var(--pdd-guide-color-pattern-theme)',
  auto: 'var(--pdd-guide-color-auto-theme)',
  fixed: 'var(--pdd-guide-color-fixed-theme)',
}

const BASELINE_COLORS = {
  line: 'var(--pdd-baseline-color-line-theme)',
  flat: 'var(--pdd-baseline-color-flat-theme)',
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

const FLEX_COLORS = {
  line: 'var(--pdd-flex-color-line-theme)',
  flat: 'var(--pdd-flex-color-flat-theme)',
  indice: 'var(--pdd-flex-color-indice-theme)',
}

const LAYOUT_COLORS = {
  line: 'var(--pdd-layout-color-line-theme)',
  flat: 'var(--pdd-layout-color-flat-theme)',
  indice: 'var(--pdd-layout-color-indice-theme)',
}

const PADDER_COLOR = 'var(--pdd-padder-color-theme)'

export const DEFAULT_CONFIG: Config = {
  base: 8,
  baseline: {
    variant: 'line',
    debugging: 'hidden',
    colors: BASELINE_COLORS,
  },
  guide: {
    variant: 'line',
    debugging: 'hidden',
    colors: GUIDE_COLORS,
  },
  spacer: {
    variant: 'line',
    debugging: 'hidden',
    colors: SPACER_COLORS,
  },
  box: {
    debugging: 'hidden',
    colors: BOX_COLORS,
  },
  flex: {
    debugging: 'hidden',
    colors: FLEX_COLORS,
  },
  layout: {
    debugging: 'hidden',
    colors: LAYOUT_COLORS,
  },
  padder: {
    debugging: 'hidden',
    color: PADDER_COLOR,
  },
} as const