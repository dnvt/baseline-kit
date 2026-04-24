/**
 * Virtual scroll range tracker.
 */

import { rafThrottle } from './timing'

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

  if (!Number.isFinite(itemHeight) || itemHeight <= 0) {
    throw new Error(
      'createVirtualTracker requires itemHeight to be greater than 0'
    )
  }

  if (!Number.isFinite(totalItems) || totalItems < 0) {
    throw new Error(
      'createVirtualTracker requires totalItems to be 0 or greater'
    )
  }

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

  const [throttledUpdate, cancelUpdate] = rafThrottle(update)

  const listenerOptions: AddEventListenerOptions = { passive: true }

  window.addEventListener('scroll', throttledUpdate, listenerOptions)
  window.addEventListener('resize', throttledUpdate, listenerOptions)

  const intersectionObserver = new IntersectionObserver(throttledUpdate, {
    threshold: 0,
  })
  intersectionObserver.observe(el)

  throttledUpdate()

  return {
    refresh: throttledUpdate,
    disconnect() {
      window.removeEventListener('scroll', throttledUpdate, listenerOptions)
      window.removeEventListener('resize', throttledUpdate, listenerOptions)
      intersectionObserver.disconnect()
      cancelUpdate()
    },
  }
}
