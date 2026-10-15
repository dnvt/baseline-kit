/**
 * Element measurement observer.
 */

import { SNAP_TOLERANCE } from '@baseline-kit/core'
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
 * Effective CSS zoom of an element. Where `currentCSSZoom` is unsupported
 * (WebKit on Linux), it multiplies the `zoom` of the element and each
 * ancestor, which is what `currentCSSZoom` reports elsewhere.
 */
export function getCSSZoom(el: Element): number {
  const zoom = (el as Element & { currentCSSZoom?: number }).currentCSSZoom
  if (typeof zoom === 'number' && zoom > 0) return zoom
  if (typeof getComputedStyle !== 'function') return 1
  let product = 1
  for (let node: Element | null = el; node; node = node.parentElement) {
    const own = parseFloat(getComputedStyle(node).zoom)
    if (own > 0) product *= own
  }
  return product
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
 * grid (`.bk-box__grid`). It is the margin of the content host,
 * `.bk-pad-content`, which is the grid's only row, or the CSS padding of a
 * Padder that draws no spacers and has no content host (`.bk-pad-plain`).
 * A caller's own padding on a Box host, or on a Padder with a content host,
 * is not counted.
 */
export function getRenderedBlockPadding(
  host: Element
): { top: number; bottom: number } | null {
  if (typeof getComputedStyle !== 'function') return null
  const target = host.classList.contains('bk-pad')
    ? host
    : (host.querySelector(':scope > .bk-pad, :scope > .bk-box__grid') ?? host)
  let top = 0
  let bottom = 0
  if (
    target.classList.contains('bk-pad-plain') &&
    !target.classList.contains('bk-pad-hosted')
  ) {
    const style = getComputedStyle(target)
    top = parseFloat(style.paddingTop)
    bottom = parseFloat(style.paddingBottom)
  } else {
    const content = target.querySelector(':scope > .bk-pad-content')
    if (content) ({ top, bottom } = readContentMargins(target, content))
  }
  return Number.isFinite(top) && Number.isFinite(bottom)
    ? { top, bottom }
    : null
}

/**
 * The block margins of a grid's content host as layout used them: its
 * offsets from the grid's content box, since layout rounds margins to its
 * own units and the computed values can be 1/40px off in Chromium. Where an
 * offset is further than SNAP_TOLERANCE from the computed margin (the
 * content overflows a fixed height, or the caller aligns it off the edges),
 * the computed margin stands.
 */
function readContentMargins(grid: Element, content: Element) {
  const zoom = getCSSZoom(grid)
  const outer = grid.getBoundingClientRect()
  const inner = content.getBoundingClientRect()
  const gridStyle = getComputedStyle(grid)
  const contentStyle = getComputedStyle(content)
  const used = (offset: number, margin: string) => {
    const computed = parseFloat(margin)
    return Math.abs(offset - computed) <= SNAP_TOLERANCE ? offset : computed
  }
  return {
    top: used(
      (inner.top - outer.top) / zoom -
        parseFloat(gridStyle.borderTopWidth) -
        parseFloat(gridStyle.paddingTop),
      contentStyle.marginTop
    ),
    bottom: used(
      (outer.bottom - inner.bottom) / zoom -
        parseFloat(gridStyle.borderBottomWidth) -
        parseFloat(gridStyle.paddingBottom),
      contentStyle.marginBottom
    ),
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
