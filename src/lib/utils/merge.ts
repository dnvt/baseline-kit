/**
 * @file merge.ts
 * @description Style and class merging utilities
 * @module utils
 */

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
): T => Object.assign({}, ...styles.filter((style): style is T => style !== undefined))

/**
 * Assigns a value to a React ref.
 */
function assignRef<T>(ref: React.Ref<T> | null | undefined, node: T | null): void {
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
    refs.forEach(ref => {
      assignRef(ref, node)
    })
  }
}