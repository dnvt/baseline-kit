import { useLayoutEffect, useState, type RefObject } from 'react'
import type { GridDimensions } from '@types'

/**
 * Hook for tracking grid container dimensions.
 * Uses ResizeObserver for efficient updates and prevents unnecessary re-renders.
 */
export function useGridDimensions(ref: RefObject<HTMLDivElement | null>): GridDimensions {
  const [dimensions, setDimensions] = useState<GridDimensions>({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    /**
     * Updates dimensions only when they actually change.
     * Uses Math.round to prevent sub-pixel differences causing unnecessary updates.
     */
    const updateDimensions = () => {
      const rect = element.getBoundingClientRect()
      const width = Math.round(rect.width)
      const height = Math.round(rect.height)

      setDimensions(prev =>
        // Prevent unnecessary re-renders if dimensions haven't changed
        prev.width === width && prev.height === height
          ? prev
          : { width, height },
      )
    }

    const observer = new ResizeObserver(updateDimensions)
    observer.observe(element)

    // Initial measurement
    updateDimensions()

    return () => observer.disconnect()
  }, [ref])

  return dimensions
}
