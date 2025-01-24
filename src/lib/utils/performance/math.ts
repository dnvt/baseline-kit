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
export function round(value: number, precision = 0): number {
  if (precision >= 0) {
  // The old code is fine for precision >= 0
    return Number(
      (
        Math.round(value * 10 ** precision) / 10 ** precision
      ).toFixed(precision),
    )
  } else {
  // negative precision => shift the decimal, round, shift back
    const absP = Math.abs(precision) // e.g. 1, 2, ...
    const factor = 10 ** absP

    // e.g. if precision = -1 => factor=10
    // 123.456 -> /10 => 12.3456 -> round(12.346) => 12 -> *10 =>120
    // 123.456 -> /100 =>1.23456 -> round(1.235) =>1 => *100 =>100
    const shifted = Math.round(value / factor)
    return shifted * factor
  }
}