/**
 * @file normalize.ts
 * @description Value normalization and standardization utilities
 * @module utils
 */
import { convertValue } from './convert'
import { clamp } from './math'

export interface NormalizationOptions {
  /** Base unit for normalization */
  base?: number
  /** Whether to round to nearest base multiple */
  round?: boolean
  /** Optional value clamping */
  clamp?: { min?: number; max?: number }
  /** Suppress warning messages */
  suppressWarnings?: boolean
}

/**
 * Normalizes CSS values to a consistent format based on base unit.
 *
 * @remarks
 * Handles:
 * - CSS length values
 * - Numeric values
 * - Special values (auto)
 * - Rounding to base unit
 * - Value clamping
 *
 * @param value - Value to normalize
 * @param options - Normalization configuration
 * @returns Normalized numeric value
 *
 * @example
 * ```ts
 * // Base unit normalization
 * normalizeValue(14, { base: 8 })  // => 16
 *
 * // With clamping
 * normalizeValue(14, {
 *   base: 8,
 *   clamp: { min: 8, max: 24 }
 * }) // => 16
 *
 * // Without rounding
 * normalizeValue(14, {
 *   base: 8,
 *   round: false
 * }) // => 14
 * ```
 */
export function normalizeValue(
  value: string | number | undefined,
  options: NormalizationOptions = {},
): number {
  const {
    base = 8,
    round: doRound = true,
    clamp: clampOptions,
    suppressWarnings = false,
  } = options

  // Handle special cases
  if (value === 'auto') return base

  // Convert to number
  let num: number | null = null
  if (typeof value === 'number') {
    num = value
  } else if (typeof value === 'string') {
    const conv = convertValue(value)
    if (conv === null) {
      if (!suppressWarnings) {
        console.error(
          `Failed to convert "${value}" to pixels. Falling back to base ${base}.`,
        )
      }
      num = base
    } else {
      num = conv
    }
  }
  if (num === null) num = base

  // Apply normalization
  const normalized = doRound ? Math.round(num / base) * base : num

  // Apply clamping if needed
  const clamped =
    clampOptions !== undefined
      ? clamp(
        normalized,
        clampOptions.min ?? -Infinity,
        clampOptions.max ?? Infinity,
      )
      : normalized

  // Warn about adjustments
  if (!suppressWarnings && clamped !== num) {
    console.warn(`Normalized ${num} to ${clamped} to match base ${base}px.`)
  }

  return clamped
}

/**
 * Normalizes a pair of CSS values.
 *
 * @param values - Tuple of values to normalize
 * @param defaults - Default values if input is undefined
 * @param options - Normalization options
 * @returns Tuple of normalized values
 *
 * @example
 * ```ts
 * normalizeValuePair(
 *   ['14px', '20px'],
 *   [0, 0],
 *   { base: 8 }
 * ) // => [16, 24]
 * ```
 */
export function normalizeValuePair(
  values:
    | [string | number | undefined, string | number | undefined]
    | undefined,
  defaults: [number, number],
  options?: NormalizationOptions,
): [number, number] {
  if (!values) return defaults

  if (values[0] === undefined && values[1] === undefined) {
    return defaults
  }

  const first =
    values[0] !== undefined ? normalizeValue(values[0], options) : defaults[0]
  const second =
    values[1] !== undefined ? normalizeValue(values[1], options) : defaults[1]
  return [first, second]
}
