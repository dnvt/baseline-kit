/**
 * Element measurement observer.
 */

import { rafThrottle } from './timing'

export interface MeasureRect {
  width: number
  height: number
}

export interface MeasureObserverHandle {
  /** Force an immediate re-measure */
  refresh(): void
  /** Stop observing */
  disconnect(): void
}

/**
 * Observes an element's dimensions via ResizeObserver.
 * Calls `onChange` with rounded width/height whenever the size changes.
 */
export function createMeasureObserver(
  el: Element,
  onChange: (rect: MeasureRect) => void
): MeasureObserverHandle {
  let prev: MeasureRect = { width: 0, height: 0 }

  const measure = () => {
    try {
      const rect = el.getBoundingClientRect()
      const next: MeasureRect = {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      }
      if (next.width !== prev.width || next.height !== prev.height) {
        prev = next
        onChange(next)
      }
    } catch {
      // element may have been removed
    }
  }

  const [throttledMeasure, cancelMeasure] = rafThrottle(measure)

  // Initial measurement
  measure()

  const observer = new ResizeObserver(throttledMeasure)
  observer.observe(el)

  return {
    refresh: throttledMeasure,
    disconnect() {
      observer.disconnect()
      cancelMeasure()
    },
  }
}
