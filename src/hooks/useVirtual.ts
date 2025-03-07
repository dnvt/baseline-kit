import { RefObject, useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { rafThrottle } from '@utils'

type VirtualResult = {
  /** Total number of items/lines to virtualize */
  totalLines: number;
  /** Height of each item in pixels */
  lineHeight: number;
  /** Reference to the scrollable container */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Additional items to render above/below viewport */
  buffer?: number | string;
}

/**
 * Hook for optimizing large lists through virtual scrolling.
 *
 * @remarks
 * This hook helps manage virtual scrolling by:
 * - Calculating visible item ranges
 * - Handling scroll events efficiently
 * - Managing buffer zones for smooth scrolling
 * - Supporting dynamic container sizes
 *
 * Performance optimizations:
 * - RAF-based scroll handling
 * - Intersection Observer for visibility
 * - Buffer zones to prevent flicker
 * - Efficient range calculations
 *
 * @param options - Virtual scrolling configuration
 * @returns Object containing start and end indices of visible items
 *
 * @example
 * ```tsx
 * function VirtualList() {
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   const { start, end } = useVirtual({
 *     totalLines: 1000,
 *     lineHeight: 30,
 *     containerRef,
 *     buffer: 5
 *   });
 *
 *   return (
 *     <div ref={containerRef} className="scroll-container">
 *       <div style={{ height: 1000 * 30 }}>
 *         {items.slice(start, end).map(item => (
 *           <div key={item.id} style={{ height: 30 }}>
 *             {item.content}
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useVirtual({
  totalLines,
  lineHeight,
  containerRef,
  buffer = 0,
}: VirtualResult) {
  // Convert buffer to numeric value
  const numericBuffer = useMemo(() =>
    typeof buffer === 'number' ? buffer : parseInt(buffer, 10) || 0
  , [buffer])

  /**
   * Calculates the visible range of items based on scroll position
   * and viewport dimensions.
   */
  const calculateRange = useCallback(() => {
    const element = containerRef.current
    if (!element) return { start: 0, end: totalLines }

    // Show all lines if container is inside .content-block
    if (element.closest('.block')) {
      return { start: 0, end: totalLines }
    }

    // Calculate visible range
    const rect = element.getBoundingClientRect()
    const offsetTop = rect.top + window.scrollY
    const viewportTop = Math.max(0, window.scrollY - offsetTop - numericBuffer)
    const viewportBottom = viewportTop + window.innerHeight + numericBuffer * 2

    const start = Math.max(0, Math.floor(viewportTop / lineHeight))
    const end = Math.min(totalLines, Math.ceil(viewportBottom / lineHeight))

    return { start, end }
  }, [totalLines, lineHeight, containerRef, numericBuffer])

  const [visibleRange, setVisibleRange] = useState(calculateRange)

  // Subscribe to window events using our helper
  useWindowEvents(['scroll', 'resize'], () => {
    updateRangeThrottled()
  })


  // Throttle updates for performance
  const updateRange = useCallback(() => {
    setVisibleRange(prev => {
      const next = calculateRange()
      return prev.start !== next.start || prev.end !== next.end ? next : prev
    })
  }, [calculateRange])

  const updateRangeThrottled = useMemo(() => rafThrottle(updateRange), [updateRange])

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    // Use IntersectionObserver for visibility tracking
    const observer = new IntersectionObserver(updateRangeThrottled, { threshold: 0 })
    observer.observe(element)
    updateRangeThrottled()

    return () => {
      observer.disconnect()
    }
  }, [containerRef, calculateRange, updateRangeThrottled])

  return visibleRange
}

/** Helper hook to manage multiple window event listeners. */
function useWindowEvents(events: string[], handler: () => void) {
  const stableHandler = useCallback(handler, [handler])

  useLayoutEffect(() => {
    const wrappedHandler = () => stableHandler()
    events.forEach(evt => window.addEventListener(evt, wrappedHandler))
    return () => events.forEach(evt => window.removeEventListener(evt, wrappedHandler))
  }, [events, stableHandler])
}

