import type { ConfigSchema } from './schema'

export const DEFAULT_CONFIG: ConfigSchema = {
  base: 8,
  baseline: {
    variant: 'line',
    debugging: 'hidden',
    colors: {
      line: 'var(--bk-baseline-color-line-theme, hsla(240, 60%, 40%, 0.15))',
      flat: 'var(--bk-baseline-color-flat-theme, hsla(230, 100%, 70%, 0.2))',
    },
  },
  guide: {
    variant: 'line',
    debugging: 'hidden',
    colors: {
      line: 'var(--bk-guide-color-line-theme, hsla(240, 60%, 40%, 0.15))',
      pattern: 'var(--bk-guide-color-pattern-theme, hsla(230, 100%, 70%, 0.2))',
      auto: 'var(--bk-guide-color-auto-theme, hsla(200, 100%, 70%, 0.15))',
      fixed: 'var(--bk-guide-color-fixed-theme, hsla(200, 100%, 70%, 0.15))',
    },
  },
  spacer: {
    variant: 'line',
    debugging: 'hidden',
    colors: {
      line: 'var(--bk-spacer-color-line-theme, hsla(270, 60%, 40%, 0.6))',
      flat: 'var(--bk-spacer-color-flat-theme, hsla(230, 100%, 70%, 0.2))',
      text: 'var(--bk-spacer-color-text-theme, hsla(270, 60%, 40%, 1))',
    },
  },
  box: {
    debugging: 'hidden',
    colors: {
      line: 'var(--bk-box-color-line-theme, hsla(300, 60%, 40%, 0.6))',
      flat: 'var(--bk-box-color-flat-theme, hsla(260, 100%, 70%, 0.2))',
      text: 'var(--bk-box-color-text-theme, hsla(300, 60%, 40%, 0.9))',
    },
  },
  padder: {
    debugging: 'hidden',
    color: 'var(--bk-padder-color-theme, hsla(270, 60%, 40%, 0.6))',
  },
} as const
