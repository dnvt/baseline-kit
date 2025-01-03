import type { CSSValue } from '@types'
import { extractCSSNumber } from './styles'
import { COMPONENTS as CONFIG } from '@config'
import { convertToPixels, isRelativeUnit } from '@/utils/units'

export type MeasurementError = {
  code: 'INVALID_INPUT' | 'NOT_NORMALIZED' | 'PARSING_ERROR'
  message: string
  value: unknown
}

type MeasurementSystemType = {
  readonly baseUnit: number
  normalize: (value: CSSValue, config?: { unit?: number, suppressWarnings?: boolean }) => number
  isNormalized: (value: CSSValue, config?: { unit?: number }) => boolean
}

export const MeasurementSystem: MeasurementSystemType = {
  baseUnit: CONFIG.baseUnit,

  normalize(value: CSSValue, { unit = CONFIG.baseUnit, suppressWarnings = false } = {}): number {
    try {
      if (value === 'auto') return unit

      // Handle string values with units
      if (typeof value === 'string') {
        // For relative units, try to get context-aware conversion
        if (isRelativeUnit(value)) {
          const pixels = convertToPixels(value, {
            parentSize: window.innerWidth, // or pass context
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            rootFontSize: parseFloat(getComputedStyle(document.documentElement).fontSize),
            parentFontSize: parseFloat(getComputedStyle(document.body).fontSize),
          })
          if (pixels !== null) {
            return Math.round(pixels / unit) * unit
          }
        }

        // For absolute units
        const pixels = convertToPixels(value) ?? unit
        return Math.round(pixels / unit) * unit
      }


      // Handle numeric values
      const num = typeof value === 'number' ? value : extractCSSNumber(value)
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
            stack: new Error().stack,
          },
        )
      }

      return normalized
    } catch
    (error) {
      console.error('Measurement normalization failed:', error)
      return unit
    }
  }
  ,

  isNormalized(value
    :
    CSSValue, { unit = CONFIG.baseUnit } = {},
  ):
    boolean {
    if (value === 'auto') return true
    if (typeof value === 'string') {
      const pixels = convertToPixels(value)
      return pixels !== null && pixels % unit === 0
    }
    const num = extractCSSNumber(value)
    return num !== null && num % unit === 0
  }
  ,
}

