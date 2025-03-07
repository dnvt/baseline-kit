import { convertValue } from './convert'

/**
 * Calculates the modulo (remainder) of a CSS value when divided by a base unit.
 *
 * @remarks
 * Useful for:
 * - Baseline grid alignment
 * - Spacing calculations
 * - Grid fitting
 *
 * @param value - Input value (number or CSS string)
 * @param base - Base unit to calculate remainder against
 * @param options - Optional calculation controls
 * @returns Remainder in pixel units (e.g., "6px")
 *
 * @example
 * ```ts
 * moduloize(14, 8)      // => "6px"
 * moduloize('14px', 8)  // => "6px"
 * moduloize(14.3, 8, { round: false }) // => "6.3px"
 * ```
 */
export function moduloize(
  value: number | string | undefined,
  base: number,
  options?: { round?: boolean },
): string {
  const doRound = options?.round ?? true
  const num =
    value === undefined
      ? 0
      : typeof value === 'number'
        ? value
        : convertValue(value) ?? 0
  const normalized = doRound ? Math.round(num) : num
  const remainder = normalized % base
  return `${remainder}px`
}

/**
 * Constrains a number within a specified range.
 *
 * @param value - Number to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Clamped value
 *
 * @example
 * ```ts
 * clamp(5, 0, 10)   // => 5
 * clamp(-5, 0, 10)  // => 0
 * clamp(15, 0, 10)  // => 10
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Rounds a number to specified precision.
 *
 * @remarks
 * Supports:
 * - Positive precision (decimal places)
 * - Negative precision (powers of 10)
 *
 * @param value - Number to round
 * @param precision - Decimal places (default: 0)
 * @returns Rounded number
 *
 * @example
 * ```ts
 * round(1.234, 2)   // => 1.23
 * round(123.4, -1)  // => 120
 * ```
 */
export function round(value: number, precision = 0): number {
  if (precision >= 0) {
    return Number((Math.round(value * 10 ** precision) / 10 ** precision).toFixed(precision))
  } else {
    const factor = 10 ** Math.abs(precision)
    return Math.round(value / factor) * factor
  }
}

/** Parameters for row count calculation */
type RowCountParams = {
  /** Available height for the container */
  height?: number;
  /** Top padding/offset value */
  top: number;
  /** Bottom padding/offset value */
  bottom: number;
  /** Base unit for calculations */
  base: number;
}

/**
 * Calculates the number of rows that fit in the available space.
 * Ensures at least one row is always returned.
 * 
 * @param params - Parameters for calculation
 * @returns Number of rows that fit in the space
 * 
 * @example
 * ```ts
 * calculateRowCount({ height: 100, top: 10, bottom: 10, base: 8 }) // => 10
 * calculateRowCount({ height: 20, top: 0, bottom: 0, base: 8 }) // => 2
 * ```
 */
export function calculateRowCount(params: RowCountParams): number {
  const { height, top, bottom, base } = params
  const totalHeight = (height ?? 0) - (top + bottom)
  return Math.max(1, Math.floor(totalHeight / base))
}