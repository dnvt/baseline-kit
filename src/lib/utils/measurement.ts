import type { CSSPixelValue } from '@types'
import { extractCSSNumber } from './styles'
import { COMPONENTS as CONFIG } from '@config'

export type MeasurementError = {
  code: 'INVALID_INPUT' | 'NOT_NORMALIZED' | 'PARSING_ERROR'
  message: string
  value: unknown
}

type MeasurementSystemType = {
  readonly baseUnit: number
  normalize: (value: CSSPixelValue, config?: { unit?: number, suppressWarnings?: boolean }) => number
  isNormalized: (value: CSSPixelValue, config?: { unit?: number }) => boolean
}

export const MeasurementSystem: MeasurementSystemType = {
  baseUnit: CONFIG.baseUnit,

  normalize(value: CSSPixelValue, { unit = CONFIG.baseUnit, suppressWarnings = false } = {}): number {
    try {
      const num = extractCSSNumber(value)
      if (num === null) {
        throw {
          code: 'INVALID_INPUT',
          message: 'Invalid numeric value',
          value,
        } satisfies MeasurementError
      }

      const normalized = Math.round(num / unit) * unit

      if (normalized !== num && !suppressWarnings) {
        console.warn(
          `Value ${num} normalized to ${normalized} to match grid baseline (${unit}px)`,
          {
            value,
            unit,
            stack: new Error().stack, // Log stack trace for debugging
          },
        )
      }

      return normalized
    } catch (error) {
      console.error('Measurement normalization failed:', error)
      return unit
    }
  },

  isNormalized(value: CSSPixelValue, { unit = CONFIG.baseUnit } = {}): boolean {
    const num = extractCSSNumber(value)
    return num !== null && num % unit === 0
  },
}
