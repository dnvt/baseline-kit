import * as React from 'react'

/**
 * Combines class names, filtering out falsy values.
 * Useful for conditionally applying class names in React components.
 *
 * @param classes - An array of class names or falsy values (e.g., `null`, `undefined`, `false`).
 * @returns A single string of class names, separated by spaces.
 */
export const mergeClasses = (
  ...classes: Array<string | boolean | undefined | null>
): string => classes.filter(Boolean).join(' ').trim()

/**
 * Combines multiple style objects into one, ensuring type safety.
 * Useful for dynamically applying styles in React components.
 *
 * @param styles - An array of style objects or `undefined`.
 * @returns A single combined style object.
 */
export const mergeStyles = <T extends React.CSSProperties>(...styles: Array<T | undefined>): T =>
  Object.assign({}, ...styles.filter((style): style is T => style !== undefined))


/**
 * Helper function for assigning a value to a ref.
 *
 * @param ref - A React ref (function or object) or `null`/`undefined`
 * @param node - The node to assign to the ref.
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
 * Merges multiple React refs (both callback refs and object refs) into a single ref callback.
 *
 * @param refs - An array of React refs (either function refs or object refs) to merge.
 * @returns A merged ref callback that updates all provided refs.
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
