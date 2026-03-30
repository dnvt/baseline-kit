/**
 * Detects if code is running in a server-side environment
 */
export const isSSR = typeof window === 'undefined'

/**
 * Default dimensions to use during server-side rendering
 */
export const SSR_DIMENSIONS = {
  width: 1024,
  height: 768,
}

/**
 * Safe window-using function that works in both server and client
 */
export function safeClientValue<T>(clientFn: () => T, fallback: T): T {
  if (isSSR) {
    return fallback
  }

  try {
    return clientFn()
  } catch {
    return fallback
  }
}

/**
 * Returns a stable value during SSR and initial render, then switches to
 * the dynamic value after hydration
 */
export function hydratedValue<T>(
  isHydrated: boolean,
  ssrValue: T,
  dynamicValue: T
): T {
  return !isHydrated || isSSR ? ssrValue : dynamicValue
}
