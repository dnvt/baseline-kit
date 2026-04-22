import * as React from 'react'

/**
 * Combines descriptor style records and React style objects.
 * Accepts Record<string, string> from descriptors and React.CSSProperties.
 */
export function mergeStyles(
  ...styles: Array<Record<string, string> | React.CSSProperties | undefined>
): React.CSSProperties {
  return Object.assign({}, ...styles.filter(Boolean))
}

/**
 * Merges multiple React refs into a single callback ref.
 */
export function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | null | undefined>
): React.RefCallback<T> {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return
      if (typeof ref === 'function') {
        ref(node)
      } else {
        Object.assign(ref, { current: node })
      }
    })
  }
}
