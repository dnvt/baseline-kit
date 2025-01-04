import { useLayoutEffect, useState, type RefObject } from 'react'
import type { GridDimensions } from '@types'
import { MeasurementSystem } from '@utils'

/**
 * Hook for tracking grid container dimensions.
 * Uses `ResizeObserver` for efficient updates and prevents unnecessary re-renders.
 *
 * @param ref - A React ref object pointing to the grid container element.
 * @returns An object containing the `width` and `height` of the container.
 */
export function useGridDimensions(ref: RefObject<HTMLDivElement | null>): GridDimensions {
  const [dimensions, setDimensions] = useState<GridDimensions>({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    /**
     * Updates the dimensions of the container.
     * Uses `getBoundingClientRect` to get the width and height and normalizes them to pixels.
     */
    const updateDimensions = () => {
      const rect = element.getBoundingClientRect()

      // Normalize width and height to pixels
      const width = MeasurementSystem.normalize(rect.width, {
        unit: 1, // Use 1 for pixel-perfect measurements
        suppressWarnings: true,
      })
      const height = MeasurementSystem.normalize(rect.height, {
        unit: 1,
        suppressWarnings: true,
      })

      setDimensions(prev =>
        prev.width === width && prev.height === height
          ? prev // Avoid unnecessary re-renders
          : { width, height },
      )
    }

    // Create a `ResizeObserver` to track size changes of the container
    const observer = new ResizeObserver(updateDimensions)
    observer.observe(element)

    // Perform an initial measurement
    updateDimensions()

    return () => observer.disconnect()
  }, [ref])

  return dimensions
}
