import {
  RefObject,
  useCallback,
  useLayoutEffect,
  useState,
} from 'react'
import { rafThrottle } from '@utils'

type Props = {
  /** Total lines for a horizontal guide (or total columns if you're using this vertically). */
  totalLines: number
  /** Pixel size of each line "step." For a horizontal baseline guide, this is your line-height in px. */
  lineHeight: number
  /** The container whose offset on the page we track. Lines outside the viewport (plus an optional buffer) won't be rendered. */
  containerRef: RefObject<HTMLDivElement | null>
  /** Extra pixel buffer above/below the viewport for "pre-rendering" lines.  */
  buffer?: number | string
}

/**
 * Hook to compute which lines in a "guide" are visible within (or near) the viewport.
 * Subscribes to scroll/resize events (and IntersectionObserver) to update in real time.
 *
 * @returns An object `{ start, end }` indicating the first and last visible line indices.
 */
export function useGuideVisibleLines({
  totalLines,
  lineHeight,
  containerRef,
  buffer = 0,
}: Props) {
  // Convert the buffer to a numeric value (e.g. 200 or parseInt("200px")).
  // If parsing fails, fallback to 0.
  const numericBuffer = typeof buffer === 'number'
    ? buffer
    : parseInt(buffer, 10) || 0

  /**
   * Calculates the currently visible range of lines, given:
   * - The container element's offset in the document.
   * - The current window scroll position.
   * - The window's viewport height.
   * - An optional numeric buffer above/below the viewport.
   */
  const calculateRange = useCallback(() => {
    const element = containerRef.current
    if (!element) {
      return { start: 0, end: totalLines }
    }

    // If the element is inside a `.content-block`, we show all lines
    // (based on your existing condition). Possibly you only want partial coverage
    // but we keep the original logic to avoid breaking existing usage.
    if (element.closest('.content-block')) {
      return { start: 0, end: totalLines }
    }

    // Compute the container's position relative to the document
    const rect = element.getBoundingClientRect()
    const offsetTop = rect.top + window.scrollY

    // The "viewport" in local coordinates of the container
    const viewportTop = Math.max(0, window.scrollY - offsetTop - numericBuffer)
    const viewportBottom = viewportTop + window.innerHeight + numericBuffer * 2

    // Convert from pixel positions to line indices
    const start = Math.max(0, Math.floor(viewportTop / lineHeight))
    const end = Math.min(totalLines, Math.ceil(viewportBottom / lineHeight))

    return { start, end }
  }, [totalLines, lineHeight, containerRef, numericBuffer])

  // Maintain the computed range in state
  const [visibleRange, setVisibleRange] = useState(calculateRange)

  // A small helper hook so we don't duplicate scroll/resize subscription logic
  useWindowEvents(['scroll', 'resize'], () => {
    // Use rafThrottle to avoid too-frequent re-renders
    updateRangeThrottled()
  })

  // We throttle the callback that updates visibleRange
  const updateRangeThrottled = rafThrottle(() => setVisibleRange(calculateRange()))

  useLayoutEffect(() => {
    // IntersectionObserver used as an additional trigger for dimension changes
    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(updateRangeThrottled, { threshold: 0 })
    observer.observe(element)

    updateRangeThrottled()

    return () => {
      observer.disconnect()
    }
  }, [containerRef, calculateRange, updateRangeThrottled])

  return visibleRange
}

/**
 * Optional helper hook to subscribe a single callback to multiple window events
 * (scroll, resize, etc.) without repeating logic.
 */
function useWindowEvents(events: string[], handler: EventListenerOrEventListenerObject) {
  useLayoutEffect(() => {
    events.forEach(evt => window.addEventListener(evt, handler, { passive: true }))

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handler))
    }
  }, [events, handler])
}