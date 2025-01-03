/**
 * Creates a debounced version of the provided function.
 * The function will only execute after the specified delay has passed since the last call.
 *
 * @param fn - The function to debounce.
 * @param delay - The delay in milliseconds.
 * @returns A debounced version of the function.
 */
export function debounce<Callback extends (...args: unknown[]) => void>(
  fn: Callback,
  delay: number,
): (...args: Parameters<Callback>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<Callback>) => {
    // Clear the existing timer, if any
    if (timer) clearTimeout(timer)

    // Set a new timer to invoke the function after the delay
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * Creates a throttled version of the provided function using `requestAnimationFrame`.
 * Ensures the function is executed at most once per animation frame.
 *
 * @param fn - The function to throttle.
 * @returns A throttled version of the function.
 */
export function rafThrottle<Callback extends (...args: unknown[]) => void>(
  fn: Callback,
): (...args: Parameters<Callback>) => void {
  let rafId: number | null = null

  return (...args: Parameters<Callback>) => {
    // If a frame is already scheduled, do nothing
    if (rafId) return

    // Schedule the function to run in the next animation frame
    rafId = requestAnimationFrame(() => {
      fn(...args)
      rafId = null // Reset the ID after execution
    })
  }
}

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
export const round = (value: number, precision = 0): number => {
  const multiplier = Math.pow(10, precision)
  return Math.round(value * multiplier) / multiplier
}
