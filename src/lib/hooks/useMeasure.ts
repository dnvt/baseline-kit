/**
 * @file useMeasure Hook
 * @description Tracks element dimensions using ResizeObserver
 * @module hooks
 */

import { useLayoutEffect, useState, useCallback, useRef, RefObject } from 'react'
import { rafThrottle } from '@utils'

export interface MeasureResult {
  /** Measured width in pixels */
  width: number;
  /** Measured height in pixels */
  height: number;
  /** Function to force a remeasurement */
  refresh: () => void;
}

/**
 * Hook for measuring and tracking DOM element dimensions.
 *
 * @remarks
 * Provides responsive element measurements using ResizeObserver, with:
 * - Performance optimization via RAF throttling
 * - Cache to prevent unnecessary updates
 * - Error handling and recovery
 * - Manual refresh capability
 *
 * The hook automatically:
 * - Initializes with 0x0 dimensions
 * - Updates on element resize
 * - Cleans up observers on unmount
 * - Rounds dimensions to whole pixels
 *
 * @param ref - Reference to the DOM element to measure
 * @returns Current dimensions and refresh function
 *
 * @example
 * ```tsx
 * function ResponsiveBox() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   const { width, height, refresh } = useMeasure(ref);
 *
 *   return (
 *     <div ref={ref} className="responsive-box">
 *       Width: {width}px, Height: {height}px
 *       <button onClick={refresh}>Remeasure</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useMeasure(ref: RefObject<HTMLElement | null>): MeasureResult {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const lastDimensions = useRef({ width: 0, height: 0 })
  const hasError = useRef(false)

  const measure = useCallback(() => {
    if (!ref.current || hasError.current) return
    try {
      const rect = ref.current.getBoundingClientRect()
      const next = {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      }

      if (lastDimensions.current.width !== next.width ||
        lastDimensions.current.height !== next.height) {
        lastDimensions.current = next
        setDimensions(next)
      }
    } catch (error) {
      hasError.current = true
      console.error('Error measuring element:', error)
      if (dimensions.width !== 0 || dimensions.height !== 0) {
        setDimensions({ width: 0, height: 0 })
      }
    }
  }, [ref, dimensions])

  const throttledMeasure = useRef(rafThrottle(measure))

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
