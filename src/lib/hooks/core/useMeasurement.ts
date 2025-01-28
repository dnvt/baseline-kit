// hooks/core/useMeasurement.ts
import { useLayoutEffect, useState, useCallback, useRef, RefObject } from 'react'
import { rafThrottle } from '@utils'

export interface Dimensions {
  width: number;
  height: number;
  refresh: () => void;
}

export function useMeasurement(ref: RefObject<HTMLElement | null>): Dimensions {
  // Track last dimensions to avoid unnecessary updates
  const lastDimensions = useRef<Omit<Dimensions, 'refresh'>>({
    width: 0,
    height: 0,
  })

  const [dimensions, setDimensions] = useState<Omit<Dimensions, 'refresh'>>({
    width: 0,
    height: 0,
  })

  // Error tracking to prevent loops
  const hasError = useRef(false)

  const measure = useCallback(() => {
    if (!ref.current || hasError.current) return

    try {
      const rect = ref.current.getBoundingClientRect()
      const next = {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      }

      // Only update if dimensions actually changed
      if (lastDimensions.current.width !== next.width ||
        lastDimensions.current.height !== next.height) {
        lastDimensions.current = next
        setDimensions(next)
      }
    } catch (error) {
      hasError.current = true
      console.warn('Error measuring element:', error)
      // Only set dimensions to 0 if we haven't already
      if (dimensions.width !== 0 || dimensions.height !== 0) {
        setDimensions({ width: 0, height: 0 })
      }
    }
  }, [ref, dimensions])

  // Create stable throttled version
  const throttledMeasure = useRef(rafThrottle(measure))

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return

    const observer = new ResizeObserver(() => {
      throttledMeasure.current()
    })

    observer.observe(ref.current)
    measure() // Initial measurement

    return () => {
      observer.disconnect()
      hasError.current = false
    }
  }, [ref, measure])

  const refresh = useCallback(() => {
    hasError.current = false
    measure()
  }, [measure])

  return {
    ...dimensions,
    refresh,
  }
}