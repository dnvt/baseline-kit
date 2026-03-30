import * as React from 'react'
import { rafThrottle } from '@baseline-kit/dom'

export interface MeasureResult {
  width: number
  height: number
  refresh: () => void
}

/**
 * Hook for measuring and tracking DOM element dimensions.
 */
export function useMeasure(
  ref: React.RefObject<HTMLElement | null>
): MeasureResult {
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 })

  const measure = React.useCallback(() => {
    if (!ref.current) return
    try {
      const rect = ref.current.getBoundingClientRect()
      const next = {
        width: rect ? Math.round(rect.width) : 0,
        height: rect ? Math.round(rect.height) : 0,
      }
      setDimensions((prev) =>
        prev.width === next.width && prev.height === next.height ? prev : next
      )
    } catch {
      setDimensions({ width: 0, height: 0 })
    }
  }, [ref])

  const refresh = React.useMemo(() => rafThrottle(measure), [measure])

  React.useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    measure()
  }, [measure])

  React.useLayoutEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return
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
