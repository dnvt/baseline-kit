/**
 * Element measurement observer.
 */

import { SNAP_TOLERANCE, UNSCALED_SNAP_TOLERANCE } from '@baseline-kit/core'
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

/** Effective CSS zoom of an element, 1 where `currentCSSZoom` is unsupported. */
export function getCSSZoom(el: Element): number {
  const zoom = (el as Element & { currentCSSZoom?: number }).currentCSSZoom
  return typeof zoom === 'number' && zoom > 0 ? zoom : 1
}

/**
 * Snap tolerance for an element: exact at whole-number scales, where browsers
 * report exact layout units, and SNAP_TOLERANCE when browser zoom, display
 * scaling, or CSS zoom scale the page by a fraction.
 */
export function getSnapTolerance(el: Element | null): number {
  if (!el || typeof window === 'undefined') return SNAP_TOLERANCE
  const scale = (window.devicePixelRatio || 1) * getCSSZoom(el)
  return Math.abs(scale - Math.round(scale)) < 1e-6
    ? UNSCALED_SNAP_TOLERANCE
    : SNAP_TOLERANCE
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
      // getBoundingClientRect includes any CSS zoom on the element or its
      // ancestors; padding is applied in unzoomed CSS px, so measure in those.
      const zoom = getCSSZoom(el)
      const rect = el.getBoundingClientRect()
      const next: MeasureRect = {
        width: Math.round(rect.width / zoom),
        height: rect.height / zoom,
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
