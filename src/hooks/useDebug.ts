import { useMemo } from 'react'
import { DebuggingMode } from '../components/Config/Config'

interface DebugResult {
  /** Whether debug visuals should be shown */
  isShown: boolean;
  /** Whether debug features exist but are hidden */
  isHidden: boolean;
  /** Whether debug features are disabled */
  isNone: boolean;
  /** Current debugging mode */
  debugging: DebuggingMode | undefined;
}

/**
 * Hook for managing component debug state and visibility.
 *
 * @remarks
 * Determines the active debugging mode by:
 * - Using prop value if provided
 * - Falling back to config value if prop is undefined
 * - Computing visibility states based on active mode
 *
 * This hook helps components:
 * - Control debug visual rendering
 * - Manage debug feature states
 * - Handle prop/config inheritance
 *
 * @param debuggingProp - Optional debugging mode from props
 * @param debuggingConfig - Debugging mode from theme/config
 * @returns Debug state information
 *
 * @example
 * ```tsx
 * function DebugComponent({ debugging: debugProp }) {
 *   const { isShown, isHidden, isNone } = useDebug(
 *     debugProp,
 *     'hidden' // Default from config
 *   );
 *
 *   return (
 *     <div>
 *       {isShown && <DebugOverlay />}
 *       {!isNone && <DebugFeatures />}
 *       <Content />
 *     </div>
 *   );
 * }
 * ```
 */
export function useDebug(
  debuggingProp?: DebuggingMode,
  debuggingConfig?: DebuggingMode,
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