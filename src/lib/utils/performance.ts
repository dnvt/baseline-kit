// Debounce
export function debounce<Callback extends (...args: unknown[]) => void>(
  fn: Callback,
  delay: number
): (...args: Parameters<Callback>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<Callback>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

// Debounce for animation
export function rafThrottle<Callback extends (...args: unknown[]) => void>(
  fn: Callback
): (...args: Parameters<Callback>) => void {
  let rafId: number | null = null

  return (...args: Parameters<Callback>) => {
    if (rafId) return

    rafId = requestAnimationFrame(() => {
      fn(...args)
      rafId = null
    })
  }
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

export const round = (value: number, precision = 0): number => {
  const multiplier = Math.pow(10, precision)
  return Math.round(value * multiplier) / multiplier
}
