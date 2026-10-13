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

/** Effective CSS zoom of an element, 1 where `currentCSSZoom` is unsupported. */
export function getCSSZoom(el: Element): number {
  const zoom = (el as Element & { currentCSSZoom?: number }).currentCSSZoom
  return typeof zoom === 'number' && zoom > 0 ? zoom : 1
}

/**
 * Whether browser zoom, display scaling, or CSS zoom scale this element by a
 * fraction, which leaves sub-pixel residues in its measured size.
 */
export function isScaledLayout(el: Element | null): boolean {
  if (!el || typeof window === 'undefined') return false
  const scale = (window.devicePixelRatio || 1) * getCSSZoom(el)
  return Math.abs(scale - Math.round(scale)) > 1e-6
}

type SettleListener = () => void
const settleListeners = new Set<SettleListener>()
let settleEventsAttached = false
// WebKit drops the listeners on `document.fonts` once its wrapper is garbage
// collected, so the wrapper is kept here.
let settleFonts: FontFaceSet | undefined

/**
 * Calls `listener` whenever layout may change after the first snap without a
 * size change being observed in time: a web font finishes loading, or a
 * background tab becomes visible. Returns an unsubscribe function.
 */
export function onSnapSettleEvent(listener: SettleListener): () => void {
  settleListeners.add(listener)
  if (!settleEventsAttached && typeof document !== 'undefined') {
    settleEventsAttached = true
    const notify = () => {
      for (const current of [...settleListeners]) current()
    }
    // WebKit fires `loading` but not `loadingdone`, so wait for the
    // `ready` promise of each load, including one already running.
    settleFonts = document.fonts
    let fontsPending = false
    const waitForFonts = () => {
      if (fontsPending || !settleFonts) return
      const ready = settleFonts.ready
      fontsPending = true
      const done = () => {
        fontsPending = false
        notify()
      }
      void ready.then(done, done)
    }
    settleFonts?.addEventListener?.('loading', waitForFonts)
    if (settleFonts?.status === 'loading') waitForFonts()
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') notify()
    })
  }
  return () => {
    settleListeners.delete(listener)
  }
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
