import type { ConversionContext } from '@baseline-kit/core'
import { getRootFontSize } from './root'

/**
 * Returns the current browser viewport and root font size for unit
 * conversion. Returns an empty object on the server so callers fall back to
 * the core defaults (1920x1080, 16px) without crashing.
 */
export function getViewportContext(): Partial<ConversionContext> {
  if (typeof window === 'undefined') return {}
  return {
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    rootFontSize: getRootFontSize(),
  }
}
