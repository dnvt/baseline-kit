import { useLayoutEffect, useState, useCallback, useRef, RefObject } from 'react'
import { rafThrottle } from '@utils'

export interface Dimensions {
  /** Measured width in pixels */
  width: number;
  /** Measured height in pixels */
  height: number;
  /** Forces a re-measure of the element. */
  refresh: () => void;
}

/**
 * useMeasure
 *
 * A React hook that observes the dimensions of a DOM element.
 * It leverages ResizeObserver for updates and throttles measurements
 * using requestAnimationFrame to optimize performance.
 *
 * @param ref - A React ref attached to the DOM element to measure.
 * @returns An object with width, height, and a refresh function.
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * const { width, height, refresh } = useMeasurement(ref);
 * ```
 */
export function useMeasure(ref: RefObject<HTMLElement | null>): Dimensions {
  // State to store the dimensions
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  // Keep track of the last measured dimensions to avoid unnecessary state updates.
  const lastDimensions = useRef({ width: 0, height: 0 })
  // Error flag to avoid repeated measurement errors.
  const hasError = useRef(false)

  // The measurement function: reads the element's dimensions.
  const measure = useCallback(() => {
    if (!ref.current || hasError.current) return
    try {
      const rect = ref.current.getBoundingClientRect()
      const next = { width: Math.round(rect.width), height: Math.round(rect.height) }
      if (lastDimensions.current.width !== next.width || lastDimensions.current.height !== next.height) {
        lastDimensions.current = next
        setDimensions(next)
      }
    } catch (error) {
      hasError.current = true
      console.warn('Error measuring element:', error)
      if (dimensions.width !== 0 || dimensions.height !== 0) {
        setDimensions({ width: 0, height: 0 })
      }
    }
  }, [ref, dimensions])

  // Create a throttled version of the measure function to avoid excessive reflows.
  const throttledMeasure = useRef(rafThrottle(measure))

  // Use a layout effect so measurements occur after DOM mutations.
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return
    const observer = new ResizeObserver(() => {
      throttledMeasure.current()
    })
    observer.observe(ref.current)
    measure()
    return () => {
      observer.disconnect()
      hasError.current = false
    }
  }, [ref, measure])

  const refresh = useCallback(() => {
    hasError.current = false
    measure()
  }, [measure])

  return { ...dimensions, refresh }
}