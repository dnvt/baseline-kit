import type { DebuggingMode } from '../types'

/**
 * Combines class names, filtering out falsy values.
 * Lightweight alternative to clsx/classnames.
 */
export const cx = (
  ...classes: Array<string | boolean | undefined | null>
): string => classes.filter(Boolean).join(' ').trim()

/**
 * Resolves component debug/visibility state from prop and config.
 * Pure function — framework-agnostic.
 */
export interface DebugState {
  isShown: boolean
  isHidden: boolean
  isNone: boolean
  debugging: DebuggingMode | undefined
}

export function resolveDebugState(
  debuggingProp?: DebuggingMode,
  debuggingConfig?: DebuggingMode
): DebugState {
  const effective = debuggingProp ?? debuggingConfig
  return {
    isShown: effective === 'visible',
    isHidden: effective === 'hidden',
    isNone: effective === 'none',
    debugging: effective,
  }
}
