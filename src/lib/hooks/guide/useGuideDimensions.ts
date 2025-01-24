import { useLayoutEffect, useState, RefObject } from 'react'
import { rafThrottle, MeasurementSystem } from '@utils'

/**
 * A hook that measures the bounding rect of a ref'd element (and its parent if needed).
 * - Immediately measures once on mount
 * - Uses ResizeObserver to update on changes
 * - Uses `rafThrottle` to avoid multiple re-renders in a single frame
 */
export function useGuideDimensions(ref: RefObject<HTMLDivElement | null>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    /**
     * This function measures the element (or its parent if height=0)
     * Then normalizes width/height with unit=1 (round to int).
     */
    function calculateDimensions() {
      const rect = element?.getBoundingClientRect()
      let { width, height } = rect ?? { width: 0, height: 0 }

      // If the child has 0 height but a parent with real size:
      if (height === 0 && element?.parentElement) {
        const parentRect = element.parentElement.getBoundingClientRect()
        height = parentRect.height
        width = parentRect.width
      }

      const normalizedWidth = MeasurementSystem.normalize(width, {
        unit: 1,
        suppressWarnings: true,
      })
      const normalizedHeight = MeasurementSystem.normalize(height, {
        unit: 1,
        suppressWarnings: true,
      })

      return {
        width: normalizedWidth,
        height: normalizedHeight,
      }
    }

    /**
     * Throttled update. We measure & only set state if dimensions changed.
     */
    const updateDimensions = rafThrottle(() => {
      const newDims = calculateDimensions()
      setDimensions(prev =>
        prev.width === newDims.width && prev.height === newDims.height
          ? prev
          : newDims,
      )
    })

    // Create observer
    const observer = new ResizeObserver(() => {
      updateDimensions()
    })

    observer.observe(element)
    if (element.parentElement) {
      observer.observe(element.parentElement)
    }

    // *Immediate initial measure* so we don’t rely solely on observer
    // This ensures your test sees a dimension after the first render
    updateDimensions()

    return () => {
      observer.disconnect()
    }
  }, [ref])

  return dimensions
}