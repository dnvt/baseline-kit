import { formatValue } from '../utils'
import type { Padding } from '../types'

export interface PadderDescriptorParams {
  base: number
  color: string
  width?: number | string
  height?: number | string
  padding: Padding
  enableSpacers: boolean
}

export interface PadderDescriptor {
  containerStyle: Record<string, string>
}

/**
 * Computes styles needed to render a Padder component.
 * Pure function — framework-agnostic.
 */
export function createPadderDescriptor(params: PadderDescriptorParams): PadderDescriptor {
  const { base, color, width, height, padding, enableSpacers } = params

  const containerStyle: Record<string, string> = {}

  if (width !== undefined && width !== 'fit-content') {
    containerStyle['--bkpw'] = formatValue(width || 'fit-content')
  }
  if (height !== undefined && height !== 'fit-content') {
    containerStyle['--bkph'] = formatValue(height || 'fit-content')
  }

  containerStyle['--bkpb'] = `${base}px`
  containerStyle['--bkpc'] = color

  if (!enableSpacers) {
    const { top, right, bottom, left } = padding
    if (top > 0 || bottom > 0) {
      containerStyle.paddingBlock = `${top}px ${bottom}px`
    }
    if (left > 0 || right > 0) {
      containerStyle.paddingInline = `${left}px ${right}px`
    }
  }

  return { containerStyle }
}
