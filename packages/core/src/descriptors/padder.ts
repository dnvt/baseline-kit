import { formatValue } from '../utils'
import type { Padding } from '../types'

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

  const containerStyle: Record<string, string> = {}

  if (width !== undefined && width !== 'fit-content') {
    containerStyle['--bkpd-w'] = formatValue(width)
  }
  if (height !== undefined && height !== 'fit-content') {
    containerStyle['--bkpd-h'] = formatValue(height)
  }

  containerStyle['--bkpd-b'] = `${base}px`
  containerStyle['--bkpd-c'] = color

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

  return { containerStyle, classTokens }
}
