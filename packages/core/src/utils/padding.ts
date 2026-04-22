import type { Padding, PaddingValue, Spacing, SpacingProps } from '../types'

export function parsePadding(spacing: SpacingProps): Padding {
  if ('padding' in spacing && spacing.padding != null) {
    return parsePaddingValue(spacing.padding)
  }

  const blockEdges =
    'block' in spacing && spacing.block != null
      ? parseBlock(spacing.block)
      : { top: 0, bottom: 0 }
  const inlineEdges =
    'inline' in spacing && spacing.inline != null
      ? parseInline(spacing.inline)
      : { left: 0, right: 0 }

  return {
    top: blockEdges.top,
    right: inlineEdges.right,
    bottom: blockEdges.bottom,
    left: inlineEdges.left,
  }
}

function parsePaddingValue(padding: PaddingValue): Padding {
  if (typeof padding === 'number') {
    return { top: padding, right: padding, bottom: padding, left: padding }
  }

  if (Array.isArray(padding)) {
    const [a = 0, b = 0, c, d] = padding
    return { top: a, right: b, bottom: c ?? a, left: d ?? b }
  }

  if (typeof padding === 'object') {
    return {
      top: padding.top ?? 0,
      right: padding.right ?? 0,
      bottom: padding.bottom ?? 0,
      left: padding.left ?? 0,
    }
  }

  return { top: 0, right: 0, bottom: 0, left: 0 }
}

function parseBlock(block: Spacing): Pick<Padding, 'top' | 'bottom'> {
  if (typeof block === 'number') {
    return { top: block, bottom: block }
  }
  if (Array.isArray(block)) {
    const [top, bottom] = block
    return { top: top ?? 0, bottom: bottom ?? 0 }
  }
  if (typeof block === 'object') {
    return { top: block.start ?? 0, bottom: block.end ?? 0 }
  }
  return { top: 0, bottom: 0 }
}

function parseInline(inline: Spacing): Pick<Padding, 'left' | 'right'> {
  if (typeof inline === 'number') {
    return { left: inline, right: inline }
  }
  if (Array.isArray(inline)) {
    const [left, right] = inline
    return { left: left ?? 0, right: right ?? 0 }
  }
  if (typeof inline === 'object') {
    return { left: inline.start ?? 0, right: inline.end ?? 0 }
  }
  return { left: 0, right: 0 }
}
