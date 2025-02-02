import { Padding, PaddingValue, Spacing, SpacingProps } from '@utils'

/**
 * Extract numeric top, right, bottom, left (in px) from `padding` or `block/inline`.
 * @param spacing - The props which may include padding, block, inline
 * @returns { top, right, bottom, left } with 0 defaults
 *
 * Priority (if padding is defined, it overrides block/inline):
 * - If `padding` is present, parse it fully (4 edges).
 * - Otherwise, parse `block` for top/bottom and `inline` for left/right.
 */
export function parsePadding(spacing: SpacingProps): Padding {
  if ('padding' in spacing && spacing.padding != null) {
    return parsePaddingValue(spacing.padding)
  }

  // Otherwise, parse block/inline separately
  const blockEdges = 'block' in spacing && spacing.block != null
    ? parseBlock(spacing.block)
    : { top: 0, bottom: 0 }
  const inlineEdges = 'inline' in spacing && spacing.inline != null
    ? parseInline(spacing.inline)
    : { left: 0, right: 0 }

  // Merge partial edges
  return {
    top: blockEdges.top,
    right: inlineEdges.right,
    bottom: blockEdges.bottom,
    left: inlineEdges.left,
  }
}

/**
 * Parses `padding` of various shapes to { top, right, bottom, left } in px.
 *
 * @param padding - number | [block, inline] | [top, right, bottom, left] | { start?: number; end?: number; left?: number; right?: number }
 */
function parsePaddingValue(padding: PaddingValue): Padding {
  if (typeof padding === 'number') {
    return { top: padding, right: padding, bottom: padding, left: padding }
  }

  if (Array.isArray(padding)) {
    // => [block, inline]
    if (padding.length === 2) {
      const [block, inline] = padding
      return { top: block, right: inline, bottom: block, left: inline }
    }
    // => [top, right, bottom, left]
    if (padding.length >= 4) {
      const [top, right, bottom, left] = padding
      return {
        top: top ?? 0,
        right: right ?? 0,
        bottom: bottom ?? 0,
        left: left ?? 0,
      }
    }
  }

  if (typeof padding === 'object' && !Array.isArray(padding)) {
    // possible keys: top, bottom, left, right, start, end
    // interpret start => top, end => bottom if you prefer
    const top = padding.top ?? 0
    const bottom = padding.bottom ?? 0
    const left = padding.left ?? 0
    const right = padding.right ?? 0
    return { top, right, bottom, left }
  }

  // fallback
  return { top: 0, right: 0, bottom: 0, left: 0 }
}

/**
 * Parses `block` of various shapes to { top, bottom } in px.
 * @param block - number | [top, bottom] | { start?: number; end?: number }
 */
function parseBlock(block: Spacing): Pick<Padding, 'top' | 'bottom'> {
  if (typeof block === 'number') {
    return { top: block, bottom: block }
  }

  // [top, bottom]
  if (Array.isArray(block)) {
    const [top, bottom] = block
    return {
      top: top ?? 0,
      bottom: bottom ?? 0,
    }
  }

  // object { start, end }
  if (typeof block === 'object') {
    return {
      top: block.start ?? 0,
      bottom: block.end ?? 0,
    }
  }

  return { top: 0, bottom: 0 }
}

/**
 * Parses `inline` of various shapes to { left, right } in px.
 * @param inline - number | [left, right] | { start?: number; end?: number }
 */
function parseInline(inline: Spacing): Pick<Padding, 'left' | 'right'> {
  if (typeof inline === 'number') {
    return { left: inline, right: inline }
  }

  if (Array.isArray(inline)) {
    const [left, right] = inline
    return {
      left: left ?? 0,
      right: right ?? 0,
    }
  }

  if (typeof inline === 'object') {
    return {
      left: inline.start ?? 0,
      right: inline.end ?? 0,
    }
  }

  return { left: 0, right: 0 }
}