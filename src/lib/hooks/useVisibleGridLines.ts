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
  const bufferPixels = useMemo(() => {
    if (typeof buffer === 'number') return buffer
    return convertToPixels(buffer) ?? DEFAULT_BUFFER
  }, [buffer])

  /**
   * Calculates the range of visible lines based on current scroll position.
   * Includes buffer zones above and below viewport for smooth scrolling.
   */
  const calculateRange = useCallback((): VisibleRange => {
    if (!containerRef.current) {
      // Return full range if container isn't mounted yet
      return { start: 0, end: totalLines }
    }

    const rect = containerRef.current.getBoundingClientRect()
    // Calculate visible area accounting for scroll position
    const viewportTop = Math.max(0, -rect.top)
    const viewportBottom = viewportTop + window.innerHeight

    return {
      // Include buffer zone above viewport
      start: Math.max(0, Math.floor(viewportTop / lineHeight) - bufferPixels),
      // Include buffer zone below viewport, but don't exceed total lines
      end: Math.min(totalLines, Math.ceil(viewportBottom / lineHeight) + bufferPixels),
    }
  }, [totalLines, lineHeight, containerRef, bufferPixels])

  // Track visible range in state
  const [visibleRange, setVisibleRange] = useState<VisibleRange>(calculateRange)

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    /**
     * Update visible range when scroll position or size changes.
     * Uses RAF internally via the browser's IntersectionObserver and event handling.
     */
    const updateRange = () => setVisibleRange(calculateRange())

    // IntersectionObserver handles element entering/leaving viewport
    const observer = new IntersectionObserver(updateRange, { threshold: 0 })
    observer.observe(element)

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
