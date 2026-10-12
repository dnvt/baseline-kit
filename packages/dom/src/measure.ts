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
 * Calls `onChange` whenever the size changes. Width is rounded; height keeps
 * fractional CSS pixels so baseline snapping can land exactly on the grid.
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
        height: rect.height,
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

  // Environments without ResizeObserver (such as jsdom) keep the initial
  // measurement and can still refresh on demand.
  const observer =
    typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(throttledMeasure)
  observer?.observe(el)

  return {
    refresh: throttledMeasure,
    disconnect() {
      observer?.disconnect()
      cancelMeasure()
    },
  }
}
