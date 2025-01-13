import type { Padding, Spacing } from './units'

/**
 * Normalizes a single spacing value into a tuple of start and end values.
 *
 * @param value - The spacing value to normalize
 * @returns A tuple of [start, end] values
 */
export function normalizeSpacing(value: Spacing): [number, number] {
  if (typeof value === 'number') return [value, value]
  if (Array.isArray(value)) return value
  return [value.start, value.end]
}

/**
 * Normalizes various padding/spacing formats into a consistent block/inline structure.
 * Supports multiple input formats:
 * - block/inline properties
 * - single number padding
 * - [block, inline] padding array
 * - [top, right, bottom, left] padding array
 * - {start, end, left, right} padding object
 *
 * @param props - Spacing properties in various supported formats
 * @returns Normalized spacing values as block and inline pairs
 */
export function normalizePadding(props: Padding): {
  block: [number, number]
  inline: [number, number]
} {
  if ('padding' in props) {
    if (typeof props.padding === 'number') {
      return {
        block: [props.padding, props.padding],
        inline: [props.padding, props.padding],
      }
    }
    if (Array.isArray(props.padding)) {
      if (props.padding.length === 2) {
        const [block, inline] = props.padding
        return {
          block: [block, block],
          inline: [inline, inline],
        }
      }
      const [top, right, bottom, left] = props.padding
      return {
        block: [top, bottom],
        inline: [left, right],
      }
    }
    const { start = 0, end = 0, left = 0, right = 0 } = props.padding
    return {
      block: [start, end],
      inline: [left, right],
    }
  }

  return {
    block: normalizeSpacing(props.block ?? 0),
    inline: normalizeSpacing(props.inline ?? 0),
  }
}
