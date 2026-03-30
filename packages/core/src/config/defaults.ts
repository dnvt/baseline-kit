import type { ConfigSchema } from './schema'

const GUIDE_COLORS = {
  line: 'var(--bk-guide-color-line-theme)',
  pattern: 'var(--bk-guide-color-pattern-theme)',
  auto: 'var(--bk-guide-color-auto-theme)',
  fixed: 'var(--bk-guide-color-fixed-theme)',
} as const

const BASELINE_COLORS = {
  line: 'var(--bk-baseline-color-line-theme)',
  flat: 'var(--bk-baseline-color-flat-theme)',
} as const

const SPACER_COLORS = {
  line: 'var(--bk-spacer-color-line-theme)',
  flat: 'var(--bk-spacer-color-flat-theme)',
  text: 'var(--bk-spacer-color-text-theme)',
} as const

const BOX_COLORS = {
  line: 'var(--bk-box-color-line-theme)',
  flat: 'var(--bk-box-color-flat-theme)',
  text: 'var(--bk-box-color-text-theme)',
} as const

const STACK_COLORS = {
  line: 'var(--bk-stack-color-line-theme)',
  flat: 'var(--bk-stack-color-flat-theme)',
  text: 'var(--bk-stack-color-text-theme)',
} as const

const LAYOUT_COLORS = {
  line: 'var(--bk-layout-color-line-theme)',
  flat: 'var(--bk-layout-color-flat-theme)',
  text: 'var(--bk-layout-color-text-theme)',
} as const

const PADDER_COLOR = 'var(--bk-padder-color-theme)'

export const DEFAULT_CONFIG: ConfigSchema = {
  base: 8,
  baseline: { variant: 'line', debugging: 'hidden', colors: BASELINE_COLORS },
  guide: { variant: 'line', debugging: 'hidden', colors: GUIDE_COLORS },
  spacer: { variant: 'line', debugging: 'hidden', colors: SPACER_COLORS },
  box: { debugging: 'hidden', colors: BOX_COLORS },
  stack: { debugging: 'hidden', colors: STACK_COLORS },
  layout: { debugging: 'hidden', colors: LAYOUT_COLORS },
  padder: { debugging: 'hidden', color: PADDER_COLOR },
} as const
