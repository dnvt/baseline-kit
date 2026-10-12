import { DEFAULT_CONFIG } from '../config/defaults'
import { compactStyle, formatValue } from '../utils'
import type { Padding } from '../types'

/** Values the stylesheet already sets on `.bk-pad`. */
const PADDER_STYLE_DEFAULTS: Record<string, string> = {
  '--bkpd-w': 'fit-content',
  '--bkpd-h': 'fit-content',
  '--bkpd-b': '8px',
  '--bkpd-c': DEFAULT_CONFIG.padder.color,
}

export interface PadderDescriptorParams {
  base: number
  color: string
  width?: number | string
  height?: number | string
  padding: Padding
  enableSpacers: boolean
  isVisible: boolean
}

export interface PadderDescriptor {
  /** Host style with stylesheet defaults omitted. */
  containerStyle: Record<string, string>
  classTokens: string[]
}

/**
 * Computes styles needed to render a Padder component.
 * Pure function — framework-agnostic.
 */
export function createPadderDescriptor(
  params: PadderDescriptorParams
): PadderDescriptor {
  const { base, color, width, height, padding, enableSpacers, isVisible } =
    params

  const containerStyle: Record<string, string> = {
    ...(width !== undefined ? { '--bkpd-w': formatValue(width) } : {}),
    ...(height !== undefined ? { '--bkpd-h': formatValue(height) } : {}),
    '--bkpd-b': `${base}px`,
    '--bkpd-c': color,
  }

  if (!enableSpacers) {
    const { top, right, bottom, left } = padding
    if (top > 0 || bottom > 0) {
      containerStyle.paddingBlock = `${top}px ${bottom}px`
    }
    if (left > 0 || right > 0) {
      containerStyle.paddingInline = `${left}px ${right}px`
    }
  }

  const classTokens = ['pad']
  if (isVisible && enableSpacers) classTokens.push('v')

  return {
    containerStyle: compactStyle(containerStyle, PADDER_STYLE_DEFAULTS),
    classTokens,
  }
}
