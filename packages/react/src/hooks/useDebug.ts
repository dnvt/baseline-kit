import { useMemo } from 'react'
import { resolveDebugState } from '@baseline-kit/core'
import type { DebuggingMode } from '@baseline-kit/core'

/**
 * Hook for managing component debug state and visibility.
 * Delegates to pure resolveDebugState in core.
 */
export function useDebug(
  debuggingProp?: DebuggingMode,
  debuggingConfig?: DebuggingMode
) {
  return useMemo(
    () => resolveDebugState(debuggingProp, debuggingConfig),
    [debuggingProp, debuggingConfig]
  )
}
