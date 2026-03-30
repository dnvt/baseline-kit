import { useMemo } from 'react'
import type { DebuggingMode } from '@baseline-kit/core'

interface DebugResult {
  isShown: boolean
  isHidden: boolean
  isNone: boolean
  debugging: DebuggingMode | undefined
}

/**
 * Hook for managing component debug state and visibility.
 */
export function useDebug(
  debuggingProp?: DebuggingMode,
  debuggingConfig?: DebuggingMode
): DebugResult {
  return useMemo(() => {
    const effective = debuggingProp ?? debuggingConfig
    return {
      isShown: effective === 'visible',
      isHidden: effective === 'hidden',
      isNone: effective === 'none',
      debugging: effective,
    }
  }, [debuggingProp, debuggingConfig])
}
