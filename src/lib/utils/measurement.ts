import { extractCSSNumber } from './styles'
import { COMPONENTS as CONFIG } from '@config'
import { convertToPixels, isRelativeUnit, CSSValue } from './units'

export type MeasurementError = {
  code: 'INVALID_INPUT' | 'NOT_NORMALIZED' | 'PARSING_ERROR'
  message: string
  value: unknown
}

type MeasurementSystemType = {
  readonly baseUnit: number
  /**
   * Normalizes a CSS value to the nearest multiple of the base unit.
   *
   * @param value - The CSS value to normalize (e.g., `px`, `em`, `rem`, etc.).
   * @param config - Optional configuration for normalization.
   * @returns The normalized value as a number.
   */
  normalize: (value: CSSValue, config?: { unit?: number; suppressWarnings?: boolean }) => number
  /**
   * Checks if a CSS value is already normalized to the base unit.
   *
   * @param value - The CSS value to check.
   * @param config - Optional configuration for checking.
   * @returns `true` if the value is normalized, otherwise `false`.
   */
  isNormalized: (value: CSSValue, config?: { unit?: number }) => boolean
}

/**
 * Utility object for handling and normalizing CSS values to a grid baseline unit.
 */
export const MeasurementSystem: MeasurementSystemType = {
  baseUnit: CONFIG.baseUnit,
  normalize(value: CSSValue, { unit = CONFIG.baseUnit, suppressWarnings = false } = {}): number {
    try {
      if (value === 'auto') return unit

      if (typeof value === 'string') {
        // For relative units, try to get context-aware conversion
        if (isRelativeUnit(value)) {
          const pixels = convertToPixels(value, {
            parentSize: window.innerWidth,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            rootFontSize: parseFloat(getComputedStyle(document.documentElement).fontSize),
            parentFontSize: parseFloat(getComputedStyle(document.body).fontSize),
          })
          if (pixels !== null) {
            return Math.round(pixels / unit) * unit
          }
        }

        // For absolute units, convert directly to pixels
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

      // Normalize the numeric value to the nearest multiple of the base unit
      const normalized = Math.round(num / unit) * unit

      // Warn if the value was not already normalized
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
    } catch (error) {
      console.error('Measurement normalization failed:', error)
      return unit // Fallback to base unit in case of error
    }
  },

  isNormalized(value: CSSValue, { unit = CONFIG.baseUnit } = {}): boolean {
    if (value === 'auto') return true

    // Check if string value can be converted to pixels and is divisible by the unit
    if (typeof value === 'string') {
      const pixels = convertToPixels(value)
      return pixels !== null && pixels % unit === 0
    }

    // Check if numeric value is divisible by the unit
    const num = extractCSSNumber(value)
    return num !== null && num % unit === 0
  },
}
