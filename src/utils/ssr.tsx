/**
 * SSR (Server-Side Rendering) utility functions for baseline-kit.
 */
import * as React from 'react'
import { useIsClient } from '../hooks/useIsClient'

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
 * @param clientFn Function that uses window/browser APIs
 * @param fallback Fallback value to use in SSR environment
 * @returns Result of clientFn in browser, fallback in SSR
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
 * @param isHydrated Boolean indicating if component is hydrated
 * @param ssrValue Value to use during SSR/initial render
 * @param dynamicValue Value to use after hydration
 */
export function hydratedValue<T>(
  isHydrated: boolean,
  ssrValue: T,
  dynamicValue: T
): T {
  return !isHydrated || isSSR ? ssrValue : dynamicValue
}

/**
 * ClientOnly component props
 * @internal
 */
interface ClientOnlyProps {
  /**
   * Content to render when on the client-side
   */
  children: React.ReactNode
  /**
   * Optional fallback to show during SSR
   */
  fallback?: React.ReactNode
}

/**
 * A utility component that only renders its children on the client side.
 * @internal Not part of the public API
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isClient = useIsClient()

  if (!isClient) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
