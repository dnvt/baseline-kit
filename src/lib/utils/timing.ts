/**
 * Creates a debounced version of the provided function.
 * The function will only execute after the specified delay has passed since the last call.
 *
 * @param fn - The function to debounce.
 * @param delay - The delay in milliseconds.
 * @returns A debounced version of the function.
 */
export const debounce = <T extends (...args: unknown[]) => void>(fn: T, delay: number): T => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return ((...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}

/**
 * Creates a throttled version of the provided function using `requestAnimationFrame`.
 * Ensures the function is executed at most once per animation frame.
 *
 * @param fn - The function to throttle.
 * @returns A throttled version of the function.
 */
export const rafThrottle = <T extends (...args: unknown[]) => void>(fn: T): T => {
  let rafId: number | null = null
  return ((...args) => {
    if (rafId) return
    rafId = requestAnimationFrame(() => {
      fn(...args)
      rafId = null
    })
  }) as T
}