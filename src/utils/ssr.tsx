/**
 * SSR (Server-Side Rendering) utility functions for baseline-kit.
 * These functions help ensure consistent rendering between server and client.
 */
import * as React from 'react'
import { useIsClient } from '@hooks'

/**
 * Detects if code is running in a server-side environment
 */
export const isSSR = typeof window === 'undefined'

/**
 * Default dimensions to use during server-side rendering
 * These values provide stable rendering between server and client
 * during the initial hydration phase.
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
 * @returns Appropriate value based on hydration state
 */
export function hydratedValue<T>(
  isHydrated: boolean,
  ssrValue: T,
  dynamicValue: T
): T {
  return !isHydrated || isSSR ? ssrValue : dynamicValue
}

export interface ClientOnlyProps {
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
 *
 * Useful for components that rely on browser-specific APIs like DOM measurements,
 * which aren't available during server-side rendering.
 *
 * @example
 * ```tsx
 * // With no fallback (renders nothing during SSR)
 * <ClientOnly>
 *   <ComponentThatNeedsMeasurements />
 * </ClientOnly>
 *
 * // With a fallback (renders placeholder during SSR)
 * <ClientOnly fallback={<div style={{ height: '500px' }} />}>
 *   <ComplexVisualization />
 * </ClientOnly>
 * ```
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isClient = useIsClient()

  // On the server or during hydration, render the fallback
  if (!isClient) {
    return <>{fallback}</>
  }

  // On the client, render the actual content
  return <>{children}</>
}
