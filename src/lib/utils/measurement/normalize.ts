import { CSSUnit, CSSValue, type RelativeUnit, clamp as clampFn } from '@utils'

export type MeasurementError = {
  code: 'INVALID_INPUT' | 'NOT_NORMALIZED' | 'PARSING_ERROR' | 'CONVERSION_ERROR'
  message: string
  value: unknown
}

type NormalizationConfig = {
  unit?: number
  suppressWarnings?: boolean
  round?: boolean
  clamp?: {
    min?: number
    max?: number
  }
}

type ConversionContext = {
  parentSize?: number
  viewportWidth?: number
  viewportHeight?: number
  rootFontSize?: number
  parentFontSize?: number
  baseSize?: number
}

type MeasurementSystemType = {
  readonly base: number

  /**
   * Normalizes a CSS value to the nearest multiple of the base unit.
   *
   * @param value - The CSS value to normalize (e.g., px, em, rem, etc.)
   * @param config - Optional configuration for normalization
   * @returns The normalized value as a number
   * @throws {MeasurementError} If conversion fails
   */
  normalize(value: CSSValue, config?: NormalizationConfig): number

  /**
   * Normalizes a dimension value with fallback to default
   *
   * @param value - The dimension value to normalize
   * @param defaultValue - Default value if input is undefined
   * @param config - Optional configuration
   */
  normalizeDimension(
    value: CSSValue | undefined,
    defaultValue: number,
    config?: NormalizationConfig,
  ): number

  /**
   * Normalizes a pair of dimension values
   *
   * @param values - Tuple of dimension values
   * @param defaults - Default values if inputs are undefined
   * @param config - Optional configuration
   */
  normalizeDimensionPair(
    values: [CSSValue?, CSSValue?] | undefined,
    defaults: [number, number],
    config?: NormalizationConfig,
  ): [number, number]

  /**
   * Normalizes dimensions from a DOMRect
   *
   * @param rect - DOMRect from element.getBoundingClientRect()
   * @param config - Optional configuration
   */
  normalizeRect(
    rect: DOMRect,
    config?: NormalizationConfig,
  ): {
    width: number
    height: number
    top: number
    left: number
  }

  /**
   * Checks if a CSS value is already normalized to the base unit
   *
   * @param value - The value to check
   * @param config - Optional configuration
   */
  isNormalized(value: CSSValue, config?: { unit?: number }): boolean

  /**
   * Converts a value from one unit to another
   *
   * @param value - The value to convert
   * @param fromUnit - Source unit
   * @param toUnit - Target unit
   * @param context - Conversion context for relative units
   */
  convert(
    value: number,
    fromUnit: CSSUnit,
    toUnit: CSSUnit,
    context?: ConversionContext,
  ): number
}

// Default values
const DEFAULT_BASE = 8
const DEFAULT_CONTEXT: Required<ConversionContext> = {
  parentSize: 0,
  viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
  viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
  rootFontSize: 16,
  parentFontSize: 16,
  baseSize: DEFAULT_BASE,
}

/**
 * Utility for handling and normalizing CSS measurements
 */
export const MeasurementSystem: MeasurementSystemType = {
  base: DEFAULT_BASE,

  normalize(value, {
    unit = DEFAULT_BASE,
    suppressWarnings = false,
    round = true,
    clamp,
  }: NormalizationConfig = {}) {
    try {
      // Handle auto special case
      if (value === 'auto') return unit

      // Handle numeric values
      if (typeof value === 'number') {
        let normalized = value

        if (round) {
          normalized = Math.round(normalized / unit) * unit
        }

        if (clamp) {
          normalized = clampFn(normalized, clamp.min ?? -Infinity, clamp.max ?? Infinity)
        }

        // Warning if value changed
        if (!suppressWarnings && normalized !== value) {
          console.warn(
            `Value ${value} normalized to ${normalized} to match grid baseline (${unit}px)`,
            { value, unit, stack: new Error().stack },
          )
        }

        return normalized
      }

      // Handle string values
      if (typeof value === 'string') {
        const match = value.match(/^([+-]?[\d.]+)([a-z%]*)$/)
        if (!match) {
          throw {
            code: 'PARSING_ERROR',
            message: 'Invalid CSS value format',
            value,
          } as MeasurementError
        }

        const [, numStr, unitStr] = match
        const num = parseFloat(numStr)
        const cssUnit = unitStr as RelativeUnit | ''

        // Convert to pixels first
        let pixels: number
        if (!cssUnit) {
          pixels = num
        } else {
          pixels = this.convert(num, cssUnit, 'px', DEFAULT_CONTEXT)
        }

        // Then normalize
        return this.normalize(pixels, { unit, suppressWarnings, round, clamp })
      }

      throw {
        code: 'INVALID_INPUT',
        message: 'Invalid value type',
        value,
      } as MeasurementError

    } catch (error) {
      if (!suppressWarnings) {
        console.error('Measurement normalization failed:', error)
      }
      return unit
    }
  },

  normalizeDimension(value, defaultValue, config) {
    if (value === undefined) return defaultValue
    return this.normalize(value, config)
  },

  normalizeDimensionPair(values, defaults, config) {
    if (!values) return defaults
    return [
      this.normalizeDimension(values[0], defaults[0], config),
      this.normalizeDimension(values[1], defaults[1], config),
    ]
  },

  normalizeRect(rect, config) {
    return {
      width: this.normalize(rect.width, config),
      height: this.normalize(rect.height, config),
      top: this.normalize(rect.top, config),
      left: this.normalize(rect.left, config),
    }
  },

  isNormalized(value: CSSValue, { unit = DEFAULT_BASE } = {}) {
    try {
      const normalized = this.normalize(value, { unit, suppressWarnings: true })
      if (typeof value === 'number') {
        return value === normalized
      }
      return parseFloat(value) === normalized
    } catch {
      return false
    }
  },

  convert(value: number, fromUnit: CSSUnit, toUnit: CSSUnit, context: Partial<ConversionContext> = {}) {
    const ctx = { ...DEFAULT_CONTEXT, ...context }

    // Convert to pixels first
    let pixels: number
    switch (fromUnit) {
    // Absolute units
    case 'px':
      pixels = value
      break
    case 'in':
      pixels = value * 96
      break
    case 'cm':
      pixels = value * 37.8
      break
    case 'mm':
      pixels = value * 3.78
      break
    case 'pt':
      pixels = value * 1.33
      break
    case 'pc':
      pixels = value * 16
      break

      // Relative units
    case 'em':
      pixels = value * ctx.parentFontSize
      break
    case 'rem':
      pixels = value * ctx.rootFontSize
      break
    case 'vh':
      pixels = (value / 100) * ctx.viewportHeight
      break
    case 'vw':
      pixels = (value / 100) * ctx.viewportWidth
      break
    case '%':
      pixels = (value / 100) * ctx.parentSize
      break
    default:
      throw {
        code: 'CONVERSION_ERROR',
        message: `Unsupported source unit: ${fromUnit}`,
        value: { value, fromUnit },
      } as MeasurementError
    }

    // Convert pixels to target unit
    switch (toUnit) {
    // Absolute units
    case 'px':
      return pixels
    case 'in':
      return pixels / 96
    case 'cm':
      return pixels / 37.8
    case 'mm':
      return pixels / 3.78
    case 'pt':
      return pixels / 1.33
    case 'pc':
      return pixels / 16

      // Relative units
    case 'em':
      return pixels / ctx.parentFontSize
    case 'rem':
      return pixels / ctx.rootFontSize
    case 'vh':
      return (pixels * 100) / ctx.viewportHeight
    case 'vw':
      return (pixels * 100) / ctx.viewportWidth
    case '%':
      return (pixels * 100) / ctx.parentSize
    default:
      throw {
        code: 'CONVERSION_ERROR',
        message: `Unsupported target unit: ${toUnit}`,
        value: { value, toUnit },
      } as MeasurementError
    }
  },
}