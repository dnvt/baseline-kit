export const debounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): [T, () => void] => {
  let timer: ReturnType<typeof setTimeout> | null = null

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const debounced = ((...args) => {
    cancel()
    timer = setTimeout(() => fn(...args), delay)
  }) as T

  return [debounced, cancel]
}

export const rafThrottle = <T extends (...args: never[]) => void>(
  fn: T
): [T, () => void] => {
  let rafId: number | null = null
  let lastArgs: Parameters<T> | null = null

  const cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
      lastArgs = null
    }
  }

  const throttled = (...args: Parameters<T>) => {
    lastArgs = args

    if (rafId !== null) {
      cancelAnimationFrame(rafId)
    }

    rafId = requestAnimationFrame(() => {
      fn(...lastArgs!)
      rafId = null
      lastArgs = null
    })
  }

  return [throttled as T, cancel]
}
