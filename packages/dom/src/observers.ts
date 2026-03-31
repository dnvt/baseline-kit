/**
 * Imperative DOM observers — framework-agnostic.
 * Each factory returns a disposable handle with `disconnect()`.
 */

import { rafThrottle } from './timing'

// ── Measure Observer ────────────────────────────────────────────────

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

  const throttledMeasure = rafThrottle(measure)

  // Initial measurement
  measure()

  const observer = new ResizeObserver(throttledMeasure)
  observer.observe(el)

  return {
    refresh: throttledMeasure,
    disconnect() {
      observer.disconnect()
    },
  }
}

// ── Virtual Scroll Tracker ──────────────────────────────────────────

export interface VirtualRange {
  start: number
  end: number
}

export interface VirtualTrackerOptions {
  totalItems: number
  itemHeight: number
  buffer?: number
}

export interface VirtualTrackerHandle {
  /** Force recalculation */
  refresh(): void
  /** Stop tracking */
  disconnect(): void
}

/**
 * Tracks which slice of a virtual list is visible in the viewport.
 * Uses IntersectionObserver + window scroll/resize events.
 */
export function createVirtualTracker(
  el: Element,
  options: VirtualTrackerOptions,
  onChange: (range: VirtualRange) => void
): VirtualTrackerHandle {
  const { totalItems, itemHeight, buffer = 0 } = options

  const calculateRange = (): VirtualRange => {
    const rect = el.getBoundingClientRect()
    const offsetTop = rect.top + window.scrollY
    const viewportTop = Math.max(0, window.scrollY - offsetTop - buffer)
    const viewportBottom = viewportTop + window.innerHeight + buffer * 2

    const start = Math.max(0, Math.floor(viewportTop / itemHeight))
    const end = Math.min(totalItems, Math.ceil(viewportBottom / itemHeight))
    return { start, end }
  }

  let prev: VirtualRange = { start: 0, end: totalItems }

  const update = () => {
    const next = calculateRange()
    if (next.start !== prev.start || next.end !== prev.end) {
      prev = next
      onChange(next)
    }
  }

  const throttledUpdate = rafThrottle(update)

  // Window events
  window.addEventListener('scroll', throttledUpdate)
  window.addEventListener('resize', throttledUpdate)

  // Intersection observer for element visibility
  const intersectionObserver = new IntersectionObserver(throttledUpdate, {
    threshold: 0,
  })
  intersectionObserver.observe(el)

  // Initial calculation
  throttledUpdate()

  return {
    refresh: throttledUpdate,
    disconnect() {
      window.removeEventListener('scroll', throttledUpdate)
      window.removeEventListener('resize', throttledUpdate)
      intersectionObserver.disconnect()
    },
  }
}
