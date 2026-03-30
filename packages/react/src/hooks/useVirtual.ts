import {
  RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import { rafThrottle } from '@baseline-kit/dom'

type VirtualResult = {
  totalLines: number
  lineHeight: number
  containerRef: RefObject<HTMLDivElement | null>
  buffer?: number | string
}

/**
 * Hook for optimizing large lists through virtual scrolling.
 */
export function useVirtual({
  totalLines,
  lineHeight,
  containerRef,
  buffer = 0,
}: VirtualResult) {
  const numericBuffer = useMemo(
    () => (typeof buffer === 'number' ? buffer : parseInt(buffer, 10) || 0),
    [buffer]
  )

  const calculateRange = useCallback(() => {
    const element = containerRef.current
    if (!element) return { start: 0, end: totalLines }

    const rect = element.getBoundingClientRect()
    const offsetTop = rect.top + window.scrollY
    const viewportTop = Math.max(0, window.scrollY - offsetTop - numericBuffer)
    const viewportBottom = viewportTop + window.innerHeight + numericBuffer * 2

    const start = Math.max(0, Math.floor(viewportTop / lineHeight))
    const end = Math.min(totalLines, Math.ceil(viewportBottom / lineHeight))

    return { start, end }
  }, [totalLines, lineHeight, containerRef, numericBuffer])

  const [visibleRange, setVisibleRange] = useState(calculateRange)

  const updateRange = useCallback(() => {
    setVisibleRange((prev) => {
      const next = calculateRange()
      return prev.start !== next.start || prev.end !== next.end ? next : prev
    })
  }, [calculateRange])

  const updateRangeThrottled = useMemo(
    () => rafThrottle(updateRange),
    [updateRange]
  )

  useWindowEvents(['scroll', 'resize'], updateRangeThrottled)

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(updateRangeThrottled, {
      threshold: 0,
    })
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
    events.forEach((evt) => window.addEventListener(evt, wrappedHandler))
    return () =>
      events.forEach((evt) => window.removeEventListener(evt, wrappedHandler))
  }, [events, stableHandler])
}
