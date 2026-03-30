import type { ConfigSchema } from './schema'

export const DEFAULT_CONFIG: ConfigSchema = {
  base: 8,
  baseline: {
    variant: 'line',
    debugging: 'hidden',
    colors: {
      line: 'var(--bk-baseline-color-line-theme)',
      flat: 'var(--bk-baseline-color-flat-theme)',
    },
  },
  guide: {
    variant: 'line',
    debugging: 'hidden',
    colors: {
      line: 'var(--bk-guide-color-line-theme)',
      pattern: 'var(--bk-guide-color-pattern-theme)',
      auto: 'var(--bk-guide-color-auto-theme)',
      fixed: 'var(--bk-guide-color-fixed-theme)',
    },
  },
  spacer: {
    variant: 'line',
    debugging: 'hidden',
    colors: {
      line: 'var(--bk-spacer-color-line-theme)',
      flat: 'var(--bk-spacer-color-flat-theme)',
      text: 'var(--bk-spacer-color-text-theme)',
    },
  },
  box: {
    debugging: 'hidden',
    colors: {
      line: 'var(--bk-box-color-line-theme)',
      flat: 'var(--bk-box-color-flat-theme)',
      text: 'var(--bk-box-color-text-theme)',
    },
  },
  stack: {
    debugging: 'hidden',
    colors: {
      line: 'var(--bk-stack-color-line-theme)',
      flat: 'var(--bk-stack-color-flat-theme)',
      text: 'var(--bk-stack-color-text-theme)',
    },
  },
  layout: {
    debugging: 'hidden',
    colors: {
      line: 'var(--bk-layout-color-line-theme)',
      flat: 'var(--bk-layout-color-flat-theme)',
      text: 'var(--bk-layout-color-text-theme)',
    },
  },
  padder: {
    debugging: 'hidden',
    color: 'var(--bk-padder-color-theme)',
  },
} as const
