import type { Config } from './Config'

const COMMON_COLORS = {
  line: 'hsla(220, 70%, 50%, 0.75)',
  flat: 'hsla(220, 70%, 50%, 0.2)',
  indice: 'hsla(220, 70%, 50%, 1)',
}

const BOX_COLORS = {
  line: 'hsla(255, 70%, 50%, 0.75)',
  flat: 'hsla(255, 70%, 50%, 0.2)',
  indice: 'hsla(255, 70%, 50%, 0.9)',
}

export const DEFAULT_CONFIG: Config = {
  base: 8,
  guide: {
    variant: 'line',
    visibility: 'hidden',
    colors: {
      line: 'hsla(220, 70%, 50%, 0.2)',
      pattern: 'hsla(255, 70%, 50%, 0.2)',
      auto: 'hsla(220, 70%, 50%, 0.2)',
      fixed: 'hsla(190, 70%, 50%, 0.2)',
    },
  },
  spacer: {
    variant: 'line',
    visibility: 'hidden',
    colors: COMMON_COLORS,
  },
  box: {
    visibility: 'hidden',
    colors: BOX_COLORS,
  },
  padder: {
    visibility: 'hidden',
    color: BOX_COLORS.line,
  },
} as const
