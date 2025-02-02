import { convertValue, CSSValue } from './index'

/**
 * Returns the modulo (remainder) of a CSSValue when divided by a base.
 * Useful for snapping logic.
 * @param value - The CSS value (number or string). If undefined, treated as 0.
 * @param base - The base unit.
 * @param options - Options controlling rounding (default: round=true).
 * @returns A string representing the remainder in pixels (e.g. "6px").
 */
export function moduloize(
  value: CSSValue | undefined,
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
 * Clamps a number within the specified minimum and maximum.
 * @param value - The number to clamp.
 * @param min - The minimum allowable value.
 * @param max - The maximum allowable value.
 * @returns The clamped value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Rounds a number to the specified precision.
 * Supports negative precision (e.g. -1 rounds to the nearest 10).
 * @param value - The number to round.
 * @param precision - The number of decimal places to round to (default is 0).
 * @returns The rounded number.
 */
export function round(value: number, precision = 0): number {
  if (precision >= 0) {
    return Number((Math.round(value * 10 ** precision) / 10 ** precision).toFixed(precision))
  } else {
    const factor = 10 ** Math.abs(precision)
    return Math.round(value / factor) * factor
  }
}