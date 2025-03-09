import { convertValue } from './convert'

/**
 * Calculates the modulo (remainder) of a CSS value when divided by a base unit.
 *
 * @param value - Input value (number or CSS string)
 * @param base - Base unit to calculate remainder against
 * @param options - Optional calculation controls
 * @returns Remainder in pixel units (e.g., "6px")
 */
export function moduloize(
  value: number | string | undefined,
  base: number,
  options?: { round?: boolean }
): string {
  const doRound = options?.round ?? true
  const num =
    value === undefined
      ? 0
      : typeof value === 'number'
        ? value
        : (convertValue(value) ?? 0)
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
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Rounds a number to specified precision.
 *
 * @param value - Number to round
 * @param precision - Decimal places (default: 0)
 * @returns Rounded number
 */
export function round(value: number, precision = 0): number {
  if (precision >= 0) {
    return Number(
      (Math.round(value * 10 ** precision) / 10 ** precision).toFixed(precision)
    )
  } else {
    const factor = 10 ** Math.abs(precision)
    return Math.round(value / factor) * factor
  }
}

/** Parameters for row count calculation */
type RowCountParams = {
  /** Available height for the container */
  height?: number
  /** Top padding/offset value */
  top: number
  /** Bottom padding/offset value */
  bottom: number
  /** Base unit for calculations */
  base: number
}

/**
 * Calculates the number of rows that fit in the available space.
 * Ensures at least one row is always returned.
 *
 * @param params - Parameters for calculation
 * @returns Number of rows that fit in the space
 */
export function calculateRowCount(params: RowCountParams): number {
  const { height, top, bottom, base } = params
  const totalHeight = (height ?? 0) - (top + bottom)
  return Math.max(1, Math.floor(totalHeight / base))
}
