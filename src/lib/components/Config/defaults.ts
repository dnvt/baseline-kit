import type { Config } from './Config'

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
    colors: {
      line: 'hsla(220, 70%, 50%, 0.75)',
      flat: 'hsla(220, 70%, 50%, 0.2)',
      indice: 'hsla(220, 70%, 50%, 1)',
    },
  },

  box: {
    colors: {
      line: 'hsla(255, 70%, 50%, 0.75)',
      flat: 'hsla(255, 70%, 50%, 0.2)',
      indice: 'hsla(255, 70%, 50%, 0.9)',
    },
    visibility: 'hidden',
  },

  padder: {
    color: 'hsla(255, 70%, 50%, 0.75)',
    visibility: 'hidden',
  },
}