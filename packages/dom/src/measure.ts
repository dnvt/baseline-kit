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

/**
 * The top and bottom snap padding a Box or Padder host renders right now:
 * mid-transition values, not the target. Null where it can't be read.
 *
 * The padding sits on the host itself (a Padder, or a Box drawn on its own
 * grid), on a Box's inner Padder (`.bk-pad`), or on a semantic Box's inner
 * grid (`.bk-box__grid`). It is either the first and last grid track around
 * `.bk-pad-content`, or the CSS padding of a Padder that draws no spacers
 * (`.bk-pad-plain`). A caller's own padding on a Box host, or on a Padder
 * that draws spacers, is not counted.
 */
export function getRenderedBlockPadding(
  host: Element
): { top: number; bottom: number } | null {
  if (typeof getComputedStyle !== 'function') return null
  const target = host.classList.contains('bk-pad')
    ? host
    : (host.querySelector(':scope > .bk-pad, :scope > .bk-box__grid') ?? host)
  const style = getComputedStyle(target)
  let top = 0
  let bottom = 0
  if (target.querySelector(':scope > .bk-pad-content')) {
    const rows = style.gridTemplateRows.split(' ')
    if (rows.length !== 3) return null
    top += parseFloat(rows[0])
    bottom += parseFloat(rows[2])
  }
  if (target.classList.contains('bk-pad-plain')) {
    top += parseFloat(style.paddingTop)
    bottom += parseFloat(style.paddingBottom)
  }
  return Number.isFinite(top) && Number.isFinite(bottom)
    ? { top, bottom }
    : null
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
