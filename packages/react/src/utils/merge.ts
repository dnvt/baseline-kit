import * as React from 'react'

/**
 * Combines multiple style objects with type safety.
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
