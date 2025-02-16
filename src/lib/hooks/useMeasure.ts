import * as React from 'react'
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
 * Provides responsive element measurements using ResizeObserver,
 * with performance optimization (via RAF throttling), error handling,
 * and a manual refresh method.
 *
 * @param ref - Reference to the DOM element to measure
 * @returns Current dimensions and refresh function
 *
 * @example
 * ```tsx
 * function ResponsiveBox() {
 *   const ref = React.useRef<HTMLDivElement>(null);
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
export function useMeasure(ref: React.RefObject<HTMLElement | null>): MeasureResult {
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 })

  // measure() reads getBoundingClientRect() from ref.current
  const measure = React.useCallback(() => {
    if (!ref.current) return
    try {
      const rect = ref.current.getBoundingClientRect()
      const next = {
        width: rect ? Math.round(rect.width) : 0,
        height: rect ? Math.round(rect.height) : 0,
      }
      setDimensions(prev =>
        prev.width === next.width && prev.height === next.height ? prev : next,
      )
    } catch (error) {
      setDimensions({ width: 0, height: 0 })
    }
  }, [ref])

  // Create a throttled version of measure using RAF.
  const refresh = React.useMemo(() => rafThrottle(measure), [measure])

  // On mount (or when ref changes) perform an immediate measurement.
  React.useLayoutEffect(() => {
    measure()
  }, [measure])

  // Set up a ResizeObserver on mount.
  React.useLayoutEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver(() => {
      refresh()
    })
    observer.observe(ref.current)
    return () => {
      observer.disconnect()
    }
  }, [ref, refresh])

  return { ...dimensions, refresh }
}
