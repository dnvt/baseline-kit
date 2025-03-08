import * as React from 'react'

/**
 * Combines class names, filtering out falsy values.
 *
 * @remarks
 * - Filters out false, null, undefined
 * - Trims whitespace
 * - Preserves order of classes
 *
 * @param classes - Array of potential class names
 * @returns Combined class string
 *
 * @example
 * ```ts
 * mergeClasses('btn', isActive && 'active', undefined)
 * // => "btn active"
 * ```
 */
export const mergeClasses = (
  ...classes: Array<string | boolean | undefined | null>
): string => classes.filter(Boolean).join(' ').trim()

/**
 * Combines multiple style objects with type safety.
 *
 * @remarks
 * - Preserves type information
 * - Handles undefined values
 * - Merges deeply nested styles
 *
 * @param styles - Array of style objects
 * @returns Combined style object
 *
 * @example
 * ```ts
 * mergeStyles(
 *   { color: 'red' },
 *   isLarge && { fontSize: '2em' },
 *   customStyles
 * )
 * ```
 */
export const mergeStyles = <T extends React.CSSProperties>(
  ...styles: Array<T | undefined>
): T =>
  Object.assign(
    {},
    ...styles.filter((style): style is T => style !== undefined)
  )

/**
 * Assigns a value to a React ref.
 */
function assignRef<T>(
  ref: React.Ref<T> | null | undefined,
  node: T | null
): void {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(node)
  } else {
    try {
      Object.assign(ref, { current: node })
    } catch (error) {
      console.error('Error assigning ref:', error)
    }
  }
}

/**
 * Merges multiple React refs into a single callback ref.
 *
 * @remarks
 * Handles:
 * - Function refs
 * - Object refs
 * - Undefined/null refs
 *
 * @param refs - Array of refs to merge
 * @returns Combined ref callback
 *
 * @example
 * ```tsx
 * const Component = React.forwardRef((props, ref) => {
 *   const localRef = useRef(null);
 *   const combinedRef = mergeRefs(ref, localRef);
 *
 *   return <div ref={combinedRef} />;
 * });
 * ```
 */
export function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | null | undefined>
): React.RefCallback<T> {
  return (node: T | null) => {
    refs.forEach((ref) => {
      assignRef(ref, node)
    })
  }
}

/**
 * Parameters for creating a style override
 */
export type StyleOverrideParams = {
  /** CSS variable key to potentially override */
  key: string
  /** Value to use if override is needed */
  value: string
  /** Default styles to compare against */
  defaultStyles: Record<string, string>
  /** Special case dimensions that should be skipped for specific values */
  skipDimensions?: {
    /** Dimensions that should be skipped when they're set to "fit-content" */
    fitContent?: string[]
    /** Dimensions that should be skipped when they're set to "auto" */
    auto?: string[]
    /** Dimensions that should be skipped when they're set to % values (like "100%") */
    fullSize?: string[]
  }
}

/**
 * Creates style overrides for CSS variables, conditionally based on comparison to defaults.
 * Only applies overrides when the value differs from the default, optimizing style objects.
 *
 * @param params - Style override parameters or individual arguments
 * @param value
 * @param defaultStyles
 * @returns Style object with override (if needed)
 *
 * @example
 * ```ts
 * // Object parameter style:
 * createStyleOverride({
 *   key: '--color',
 *   value: 'red',
 *   defaultStyles: { '--color': 'blue' }
 * })
 * // => { '--color': 'red' }
 *
 * // With dimension skipping:
 * createStyleOverride({
 *   key: '--width',
 *   value: 'fit-content',
 *   defaultStyles: { '--width': 'auto' },
 *   skipDimensions: { fitContent: ['--width', '--height'] }
 * })
 * // => {}
 *
 * // Legacy style with separate arguments:
 * createStyleOverride('--color', 'red', { '--color': 'blue' })
 * // => { '--color': 'red' }
 * ```
 */
export function createStyleOverride(
  params: StyleOverrideParams | string,
  value?: string,
  defaultStyles?: Record<string, string>
): Record<string, string | number> {
  // Handle both object parameter and individual arguments for backward compatibility
  const key = typeof params === 'string' ? params : params.key
  const val = typeof params === 'string' ? value! : params.value
  const defaults =
    typeof params === 'string' ? defaultStyles! : params.defaultStyles
  const skipDimensions =
    typeof params === 'object' ? params.skipDimensions : undefined

  // Skip dimensions based on specific values
  if (skipDimensions) {
    // Skip 'fit-content' dimensions (Box, Spacer patterns)
    if (skipDimensions.fitContent?.includes(key) && val === 'fit-content') {
      return {}
    }

    // Skip 'auto' dimensions (Stack, Layout patterns)
    if (skipDimensions.auto?.includes(key) && val === 'auto') {
      return {}
    }

    // Skip '100%' or '100vh/vw' dimensions (Guide, some Spacer patterns)
    if (
      skipDimensions.fullSize?.includes(key) &&
      (val === '100%' || val === '100vh' || val === '100vw')
    ) {
      return {}
    }
  }

  // Only apply override if value differs from default
  return val !== defaults[key] ? { [key]: val } : {}
}
