import { DEFAULT_CONFIG } from '../config/defaults'
import { compactStyle, formatValue } from '../utils'
import type { Padding } from '../types'

/** Values the stylesheet already sets on `.bk-pad`. */
const PADDER_STYLE_DEFAULTS: Record<string, string> = {
  '--bkpd-w': 'fit-content',
  '--bkpd-h': 'fit-content',
  '--bkpd-c': DEFAULT_CONFIG.padder.color,
}

export interface PadderDescriptorParams {
  color: string
  width?: number | string
  height?: number | string
  padding: Padding
  enableSpacers: boolean
  isVisible: boolean
  /**
   * Whether the children sit in a content host (`.bk-pad-content`), as they
   * always do with spacers.
   */
  contentHost?: boolean
}

export interface PadderDescriptor {
  /** Host style with stylesheet defaults omitted. */
  containerStyle: Record<string, string>
  /**
   * With a content host: margins that place the block padding around the
   * content, which is the grid's only row so every engine reads its baseline.
   */
  contentStyle?: Record<string, string>
  /** With spacers: keeps the left and right spacers between the top and bottom ones. */
  sideStyle?: Record<string, string>
  classTokens: string[]
}

/**
 * Computes styles needed to render a Padder component.
 * Pure function — framework-agnostic.
 */
export function createPadderDescriptor(
  params: PadderDescriptorParams
): PadderDescriptor {
  const { color, width, height, padding, enableSpacers, isVisible } = params
  const contentHost = enableSpacers || params.contentHost === true

  const containerStyle: Record<string, string> = {
    ...(width !== undefined ? { '--bkpd-w': formatValue(width) } : {}),
    ...(height !== undefined ? { '--bkpd-h': formatValue(height) } : {}),
    '--bkpd-c': color,
  }

  const { top, right, bottom, left } = padding
  const contentStyle: Record<string, string> = {}
  const sideStyle: Record<string, string> = {}
  if (!enableSpacers) {
    if (top > 0 || bottom > 0) {
      // A content host takes the block padding as its margin, as with
      // spacers: WebKit misreads the baseline of a Box's inner grid with
      // bottom padding.
      if (contentHost) contentStyle.marginBlock = `${top}px ${bottom}px`
      else containerStyle.paddingBlock = `${top}px ${bottom}px`
    }
    if (left > 0 || right > 0) {
      containerStyle.paddingInline = `${left}px ${right}px`
    }
  } else {
    // The spacers paint the padding out of flow, so the grid sizes it.
    if (left > 0 || right > 0) {
      containerStyle.gridTemplateColumns = `${left}px 1fr ${right}px`
    }
    if (top > 0 || bottom > 0) {
      contentStyle.marginBlock = `${top}px ${bottom}px`
    }
    sideStyle.insetBlock = `${top}px ${bottom}px`
  }

  const classTokens = ['pad']
  if (isVisible && enableSpacers) classTokens.push('v')
  // Marks a Padder drawing no spacers; without a content host its block
  // padding is CSS padding, read back while it animates (see
  // getRenderedBlockPadding in the dom package).
  if (!enableSpacers) classTokens.push('pad-plain')
  // Marks a content host that is the grid's only row (see the stylesheet).
  if (contentHost) classTokens.push('pad-hosted')

  return {
    containerStyle: compactStyle(containerStyle, PADDER_STYLE_DEFAULTS),
    contentStyle,
    sideStyle,
    classTokens,
  }
}
