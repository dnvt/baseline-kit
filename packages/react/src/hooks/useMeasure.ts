import * as React from 'react'
import { createMeasureObserver } from '@baseline-kit/dom/measure'
import type { MeasureRect } from '@baseline-kit/dom/measure'

export interface MeasureResult extends MeasureRect {
  refresh: () => void
}

const ZERO: MeasureRect = { width: 0, height: 0 }

/**
 * Hook for measuring and tracking DOM element dimensions.
 * Thin wrapper around the imperative createMeasureObserver from @baseline-kit/dom.
 */
export function useMeasure(
  ref: React.RefObject<HTMLElement | null>,
  /** Called with each new measurement, before it is stored in state. */
  onMeasure?: (rect: MeasureRect) => void
): MeasureResult {
  const [dimensions, setDimensions] = React.useState<MeasureRect>(ZERO)
  const onMeasureRef = React.useRef(onMeasure)
  React.useLayoutEffect(() => {
    onMeasureRef.current = onMeasure
  })
  const observedRef = React.useRef<{
    element: HTMLElement
    handle: ReturnType<typeof createMeasureObserver>
  } | null>(null)

  // Runs after every commit, because the ref can point at a new element
  // (a Box whose `as` changes).
  React.useLayoutEffect(() => {
    const element = ref.current
    if (observedRef.current?.element === element) return
    observedRef.current?.handle.disconnect()
    observedRef.current = element
      ? {
          element,
          handle: createMeasureObserver(element, (rect) => {
            onMeasureRef.current?.(rect)
            setDimensions((prev) =>
              prev.width === rect.width && prev.height === rect.height
                ? prev
                : rect
            )
          }),
        }
      : null
  })

  React.useLayoutEffect(
    () => () => {
      observedRef.current?.handle.disconnect()
      observedRef.current = null
    },
    []
  )

  const refresh = React.useCallback(() => {
    observedRef.current?.handle.refresh()
  }, [])

  return { ...dimensions, refresh }
}
