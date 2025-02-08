import type { Config } from './Config'

const GUIDE_COLORS = {
  line: 'var(--bk-guide-color-line-theme)',
  pattern: 'var(--bk-guide-color-pattern-theme)',
  auto: 'var(--bk-guide-color-auto-theme)',
  fixed: 'var(--bk-guide-color-fixed-theme)',
}

const BASELINE_COLORS = {
  line: 'var(--bk-baseline-color-line-theme)',
  flat: 'var(--bk-baseline-color-flat-theme)',
}

const SPACER_COLORS = {
  line: 'var(--bk-spacer-color-line-theme)',
  flat: 'var(--bk-spacer-color-flat-theme)',
  indice: 'var(--bk-spacer-color-indice-theme)',
}

const BOX_COLORS = {
  line: 'var(--bk-box-color-line-theme)',
  flat: 'var(--bk-box-color-flat-theme)',
  indice: 'var(--bk-box-color-indice-theme)',
}

const STACK_COLORS = {
  line: 'var(--bk-stack-color-line-theme)',
  flat: 'var(--bk-stack-color-flat-theme)',
  indice: 'var(--bk-stack-color-indice-theme)',
}

const LAYOUT_COLORS = {
  line: 'var(--bk-layout-color-line-theme)',
  flat: 'var(--bk-layout-color-flat-theme)',
  indice: 'var(--bk-layout-color-indice-theme)',
}

const PADDER_COLOR = 'var(--bk-padder-color-theme)'

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
    colors: STACK_COLORS,
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