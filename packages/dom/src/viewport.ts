import type { ConversionContext } from '@baseline-kit/core'

/**
 * Returns the current browser viewport for vw/vh/vmin/vmax conversion.
 * Returns an empty object on the server so callers fall back to the
 * core defaults without crashing.
 */
export function getViewportContext(): Partial<ConversionContext> {
  if (typeof window === 'undefined') return {}
  return {
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  }
}
