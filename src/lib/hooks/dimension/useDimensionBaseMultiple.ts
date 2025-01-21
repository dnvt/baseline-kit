import { useLayoutEffect, RefObject } from 'react'

/**
 * useDimensionBaseMultiple
 *
 * A simple hook that checks the actual rendered height of an element
 * and warns if it's not a multiple of the given `base`.
 *
 * @param ref - A ref to the DOM element you want to measure.
 * @param base - The base unit you expect the height to align with.
 * @param enabled - (optional) if false, skip the warning logic.
 */
export function useDimensionBaseMultiple(
  ref: RefObject<HTMLElement | null>,
  base: number,
  enabled = true,
) {
  useLayoutEffect(() => {
    if (!enabled) return

    const elem = ref.current
    if (!elem) return

    // Measure the rendered height
    const rect = elem.getBoundingClientRect()
    // Round or floor the height if you like
    const height = Math.round(rect.height)

    // Check if it’s not a multiple
    if (height % base !== 0) {
      console.warn(
        `The element’s height (${height}px) is not a multiple of the base unit (${base}px).`,
        {
          height,
          base,
          stack: new Error().stack,
        },
      )
    }
  }, [ref, base, enabled])
}