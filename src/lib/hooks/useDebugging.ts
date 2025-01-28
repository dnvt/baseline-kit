import { useMemo } from 'react'
import { DebuggingMode } from '@components'

export function useDebugging(
  debuggingProp?: DebuggingMode,
  debuggingConfig?: DebuggingMode,
) {
  return useMemo(() => ({
    isShown: (debuggingProp ?? debuggingConfig) === 'visible',
    isHidden: (debuggingProp ?? debuggingConfig) === 'hidden',
    isNone: (debuggingProp ?? debuggingConfig) === 'none',
  }), [debuggingProp, debuggingConfig])
}