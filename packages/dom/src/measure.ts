/**
 * Element measurement observer.
 */

import { rafThrottle } from './timing'
import type { Padding } from '@baseline-kit/core'

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

export interface MeasureObserverOptions {
  /** Keep fractional CSS pixel heights when false. Width remains rounded. */
  round?: boolean
}

/** Read the CSS-seeded rows that already determine this Box's first paint. */
export function getSeededBaselinePadding(
  element: Element | null,
  initial: Padding
): Padding {
  const view = element?.ownerDocument.defaultView
  if (!element || !view) return initial

  const style = view.getComputedStyle(element)
  if (!style.getPropertyValue('--bkbx-initial-is').trim()) return initial

  const rows = style.gridTemplateRows.split(/\s+/)
  if (rows.length < 3) return initial

  const top = Number.parseFloat(rows[0])
  const bottom = Number.parseFloat(rows[rows.length - 1])
  if (!Number.isFinite(top) || !Number.isFinite(bottom)) return initial

  return { ...initial, top, bottom }
}

/** Remove first-paint seed padding before computing the final measured snap. */
export function getUnseededBaselineHeight(
  element: Element | null,
  height: number,
  initialTop: number,
  initialBottom: number
): number {
  const view = element?.ownerDocument.defaultView
  if (!element || !view) return height

  const style = view.getComputedStyle(element)
  if (!style.getPropertyValue('--bkbx-initial-is').trim()) return height

  const rows = style.gridTemplateRows.split(/\s+/)
  if (rows.length < 3) return height

  const renderedTop = Number.parseFloat(rows[0])
  const renderedBottom = Number.parseFloat(rows[rows.length - 1])
  if (!Number.isFinite(renderedTop) || !Number.isFinite(renderedBottom)) {
    return height
  }

  return height - (renderedTop - initialTop) - (renderedBottom - initialBottom)
}

/**
 * Observes an element's dimensions via ResizeObserver.
 * Calls `onChange` whenever the size changes. Height can preserve fractional
 * CSS pixels when `{ round: false }` is passed.
 */
export function createMeasureObserver(
  el: Element,
  onChange: (rect: MeasureRect) => void,
  { round = true }: MeasureObserverOptions = {}
): MeasureObserverHandle {
  let prev: MeasureRect = { width: 0, height: 0 }

  const measure = () => {
    try {
      const rect = el.getBoundingClientRect()
      const next: MeasureRect = {
        width: Math.round(rect.width),
        height: round ? Math.round(rect.height) : rect.height,
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
