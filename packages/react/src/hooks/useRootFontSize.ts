import * as React from 'react'
import { DEFAULT_ROOT_FONT_SIZE } from '@baseline-kit/core/config/base'
import { getRootFontSize, subscribeRootFontSize } from '@baseline-kit/dom'

const subscribeNothing = () => () => {}
const serverRootFontSize = () => DEFAULT_ROOT_FONT_SIZE

/**
 * The live root font size while `enabled`, re-rendering when it changes.
 * Server renders and hydration use 16px, so whatever depends on it hydrates
 * without a mismatch and re-resolves after.
 */
export function useRootFontSize(enabled: boolean): number {
  return React.useSyncExternalStore(
    enabled ? subscribeRootFontSize : subscribeNothing,
    enabled ? getRootFontSize : serverRootFontSize,
    serverRootFontSize
  )
}
