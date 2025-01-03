import { useState, useCallback, useLayoutEffect, useMemo } from 'react'
import type { RefObject } from 'react'
import type { CSSValue, VisibleRange } from '@types'
import { convertToPixels } from '@utils'

// Buffer size in pixels to render additional lines above and below viewport
// Prevents visible gaps during fast scrolling
const DEFAULT_BUFFER = 160

/**
 * Hook for calculating which grid lines should be rendered based on viewport visibility.
 * Optimizes performance by only rendering lines that are visible or about to become visible.
 *
 * @param totalLines - Total number of grid lines.
 * @param lineHeight - The height of each grid line in pixels.
 * @param containerRef - A React ref object pointing to the grid container element.
 * @param buffer - The buffer zone (in pixels or CSS value) above and below the viewport.
 * @returns An object representing the visible range of grid lines (`start` and `end` indices).
 */
export function useVisibleGridLines({
  totalLines,
  lineHeight,
  containerRef,
  buffer = DEFAULT_BUFFER,
}: {
  totalLines: number;
  lineHeight: number;
  containerRef: RefObject<HTMLDivElement>;
  buffer?: CSSValue;
}): VisibleRange {
  // Convert buffer to pixels if it's a CSS value
  const bufferPixels = useMemo(() => {
    if (typeof buffer === 'number') return buffer
    return convertToPixels(buffer) ?? DEFAULT_BUFFER
  }, [buffer])

  /**
   * Calculates the range of visible lines based on the current scroll position.
   * Includes buffer zones above and below the viewport for smooth scrolling.
   */
  const calculateRange = useCallback((): VisibleRange => {
    if (!containerRef.current) {
      // Return full range if container isn't mounted yet
      return { start: 0, end: totalLines }
    }

    const rect = containerRef.current.getBoundingClientRect()

    // Calculate the top of the viewport relative to the container
    const viewportTop = Math.max(0, -rect.top)

    // Calculate the bottom of the viewport relative to the container
    const viewportBottom = viewportTop + window.innerHeight

    return {
      // Include buffer zone above the viewport
      start: Math.max(0, Math.floor(viewportTop / lineHeight) - bufferPixels),
      // Include buffer zone below the viewport, but do not exceed total lines
      end: Math.min(totalLines, Math.ceil(viewportBottom / lineHeight) + bufferPixels),
    }
  }, [totalLines, lineHeight, containerRef, bufferPixels])

  const [visibleRange, setVisibleRange] = useState<VisibleRange>(calculateRange)

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    /**
     * Updates the visible range when the scroll position or window size changes.
     * Uses requestAnimationFrame internally via the browser's IntersectionObserver and event handling.
     */
    const updateRange = () => setVisibleRange(calculateRange())

    // Create an IntersectionObserver to track when the container enters or leaves the viewport
    const observer = new IntersectionObserver(updateRange, { threshold: 0 })
    observer.observe(element)

    // Add event listeners for scroll and resize events
    window.addEventListener('scroll', updateRange, { passive: true })
    window.addEventListener('resize', updateRange, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updateRange)
      window.removeEventListener('resize', updateRange)
    }
  }, [calculateRange, containerRef])

  return visibleRange
}
