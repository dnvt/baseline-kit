import { DEFAULT_ROOT_FONT_SIZE } from '@baseline-kit/core'

const listeners = new Set<() => void>()
let probe: HTMLElement | null = null
let observer: ResizeObserver | null = null
// Kept current while watched, so reads during renders don't restyle.
let watched: number | null = null

function readRootFontSize(): number {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function')
    return DEFAULT_ROOT_FONT_SIZE
  const size = parseFloat(getComputedStyle(document.documentElement).fontSize)
  return size > 0 ? size : DEFAULT_ROOT_FONT_SIZE
}

/** The root font size in px: live in the browser, 16 on the server. */
export function getRootFontSize(): number {
  return watched ?? readRootFontSize()
}

// Under <html>, beside <body>: frameworks that diff the body's children on
// navigation (Remix 3 pairs unkeyed elements by position) can't adopt it.
function attachProbe() {
  if (!probe) return
  document.documentElement.appendChild(probe)
}

function onProbeResize() {
  // Something removed the probe (a root replacing its container's children):
  // put it back so root changes keep being observed.
  if (probe && !probe.isConnected) attachProbe()
  const next = readRootFontSize()
  if (next === watched) return
  watched = next
  for (const listener of [...listeners]) listener()
}

function startWatching() {
  if (typeof document === 'undefined' || typeof ResizeObserver !== 'function')
    return
  watched = readRootFontSize()
  // One hidden 1rem-wide element for every subscriber: its width changes
  // exactly when the root font size does.
  probe = document.createElement('div')
  probe.setAttribute('aria-hidden', 'true')
  probe.setAttribute('data-bk-root-probe', '')
  probe.style.cssText =
    'position:fixed;top:0;left:0;width:1rem;height:0;overflow:hidden;visibility:hidden;pointer-events:none'
  attachProbe()
  observer = new ResizeObserver(onProbeResize)
  observer.observe(probe)
}

function stopWatching() {
  observer?.disconnect()
  // Only while it is still the probe: never remove an element it became.
  if (probe?.hasAttribute('data-bk-root-probe')) probe.remove()
  observer = null
  probe = null
  watched = null
}

/**
 * Calls `listener` after the root font size changes, whether from a
 * stylesheet, an inline style, or the user's default font size. Returns the
 * unsubscribe function.
 */
export function subscribeRootFontSize(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) startWatching()
  return () => {
    if (!listeners.delete(listener)) return
    if (listeners.size === 0) stopWatching()
  }
}
