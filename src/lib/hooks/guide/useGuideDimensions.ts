import { useLayoutEffect, useState, type RefObject } from 'react'
import { MeasurementSystem, rafThrottle } from '@utils'

/**
 * Hook for tracking grid container dimensions.
 * Uses `ResizeObserver` for efficient updates and prevents unnecessary re-renders.
 *
 * @param ref - A React ref object pointing to the grid container element.
 * @returns An object containing the `width` and `height` of the container.
 */
export function useGuideDimensions(ref: RefObject<HTMLDivElement | null>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const calculateDimensions = () => {
      const rect = element.getBoundingClientRect()
      const parent = element.parentElement
      const height = rect.height === 0 && parent ? parent.getBoundingClientRect().height : rect.height

      return {
        width: MeasurementSystem.normalize(rect.width, { unit: 1, suppressWarnings: true }),
        height: MeasurementSystem.normalize(height, { unit: 1, suppressWarnings: true }),
      }
    }

    const observer = new ResizeObserver(
      rafThrottle(() => {
        const newDimensions = calculateDimensions()
        setDimensions(prev =>
          prev.width === newDimensions.width && prev.height === newDimensions.height
            ? prev
            : newDimensions,
        )
      }),
    )

    observer.observe(element)
    if (element.parentElement) observer.observe(element.parentElement)

    return () => observer.disconnect()
  }, [ref])

  return dimensions
}
