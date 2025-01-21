/**
 * Clamps a number within the specified range.
 *
 * @param value - The number to clamp.
 * @param min - The minimum allowable value.
 * @param max - The maximum allowable value.
 * @returns The clamped value.
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

/**
 * Rounds a number to the specified precision.
 *
 * @param value - The number to round.
 * @param precision - The number of decimal places to round to (default is 0).
 * @returns The rounded number.
 */
export const round = (value: number, precision = 0): number =>
  Number((Math.round(value * 10 ** precision) / 10 ** precision).toFixed(precision))
