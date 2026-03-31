import * as React from 'react'
import { createMeasureObserver } from '@baseline-kit/dom'
import type { MeasureRect } from '@baseline-kit/dom'

export interface MeasureResult extends MeasureRect {
  refresh: () => void
}

const ZERO: MeasureRect = { width: 0, height: 0 }

/**
 * Hook for measuring and tracking DOM element dimensions.
 * Thin wrapper around the imperative createMeasureObserver from @baseline-kit/dom.
 */
export function useMeasure(
  ref: React.RefObject<HTMLElement | null>
): MeasureResult {
  const [dimensions, setDimensions] = React.useState<MeasureRect>(ZERO)
  const handleRef = React.useRef<ReturnType<
    typeof createMeasureObserver
  > | null>(null)

  React.useLayoutEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return

    const handle = createMeasureObserver(ref.current, (rect) => {
      setDimensions((prev) =>
        prev.width === rect.width && prev.height === rect.height ? prev : rect
      )
    })
    handleRef.current = handle

    return () => {
      handle.disconnect()
      handleRef.current = null
    }
  }, [ref])

  const refresh = React.useCallback(() => {
    handleRef.current?.refresh()
  }, [])

  return { ...dimensions, refresh }
}
