import { RefObject, useCallback, useLayoutEffect, useState } from 'react'
import { createVirtualTracker } from '@baseline-kit/dom/virtual'
import type { VirtualRange } from '@baseline-kit/dom/virtual'

type VirtualOptions = {
  totalLines: number
  lineHeight: number
  containerRef: RefObject<HTMLDivElement | null>
  buffer?: number | string
}

/**
 * Hook for optimizing large lists through virtual scrolling.
 * Thin wrapper around the imperative createVirtualTracker from @baseline-kit/dom.
 */
export function useVirtual({
  totalLines,
  lineHeight,
  containerRef,
  buffer = 0,
}: VirtualOptions) {
  const numericBuffer =
    typeof buffer === 'number' ? buffer : parseInt(buffer, 10) || 0

  const [visibleRange, setVisibleRange] = useState<VirtualRange>({
    start: 0,
    end: totalLines,
  })

  const updateRange = useCallback((range: VirtualRange) => {
    setVisibleRange((prev) =>
      prev.start === range.start && prev.end === range.end ? prev : range
    )
  }, [])

  useLayoutEffect(() => {
    if (!containerRef.current) return

    // The first client measurement can change the descriptor's total line
    // count (for example, from a relative CSS height to the measured pixels).
    // Reset the range for that new total before tracking it; otherwise the
    // previous one-item fallback can remain mounted forever.
    setVisibleRange((prev) =>
      prev.start === 0 && prev.end === totalLines
        ? prev
        : { start: 0, end: totalLines }
    )

    const handle = createVirtualTracker(
      containerRef.current,
      { totalItems: totalLines, itemHeight: lineHeight, buffer: numericBuffer },
      updateRange
    )

    return () => handle.disconnect()
  }, [containerRef, totalLines, lineHeight, numericBuffer, updateRange])

  return visibleRange
}
