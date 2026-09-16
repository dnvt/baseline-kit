import { formatValue, createGridSpanStyles } from '../utils'

export interface BoxDescriptorParams {
  base: number
  lineColor: string
  width?: number | string
  height?: number | string
  span?: number
  colSpan?: number
  rowSpan?: number
  isVisible: boolean
}

export interface BoxDescriptor {
  boxStyle: Record<string, string>
  gridSpanStyle: Record<string, string>
  classTokens: string[]
}

/**
 * Computes styles needed to render a Box component.
 * Pure function — framework-agnostic.
 */
export function createBoxDescriptor(
  params: BoxDescriptorParams
): BoxDescriptor {
  const { lineColor, width, height, span, colSpan, rowSpan, isVisible } = params

  const boxStyle: Record<string, string> = {
    ...(width !== undefined ? { '--bkbx-w': formatValue(width) } : {}),
    ...(height !== undefined ? { '--bkbx-h': formatValue(height) } : {}),
    // Config is context, not a DOM wrapper. The consuming Box must receive
    // its resolved painted value directly so nested/sibling Config scopes do
    // not depend on a root-level custom property.
    '--bkbx-cl': lineColor,
  }

  const gridSpanStyle = createGridSpanStyles(span, colSpan, rowSpan)

  const classTokens = ['box']
  if (isVisible) classTokens.push('v')

  return { boxStyle, gridSpanStyle, classTokens }
}
