import { formatValue, createStyleOverride, createGridSpanStyles } from '../utils'

export interface BoxDescriptorParams {
  base: number
  lineColor: string
  width?: number | string
  height?: number | string
  span?: number
  colSpan?: number
  rowSpan?: number
}

export interface BoxDescriptor {
  boxStyle: Record<string, string>
  gridSpanStyle: Record<string, string>
}

const BOX_DEFAULTS = (base: number, lineColor: string): Record<string, string> => ({
  '--bkboxw': 'auto',
  '--bkboxh': 'auto',
  '--bkboxc': lineColor,
  '--bkboxb': `${base}px`,
})

/**
 * Computes styles needed to render a Box component.
 * Pure function — framework-agnostic.
 */
export function createBoxDescriptor(params: BoxDescriptorParams): BoxDescriptor {
  const { base, lineColor, width, height, span, colSpan, rowSpan } = params

  const defaultStyles = BOX_DEFAULTS(base, lineColor)
  const dimensionVars = ['--bkboxw', '--bkboxh']

  const boxStyle: Record<string, string> = {
    ...createStyleOverride({ key: '--bkboxw', value: formatValue(width || 'fit-content'), defaultStyles, skipDimensions: { fitContent: dimensionVars } }),
    ...createStyleOverride({ key: '--bkboxh', value: formatValue(height || 'fit-content'), defaultStyles, skipDimensions: { fitContent: dimensionVars } }),
    ...createStyleOverride({ key: '--bkboxb', value: `${base}px`, defaultStyles }),
    ...createStyleOverride({ key: '--bkboxc', value: lineColor, defaultStyles }),
  }

  const gridSpanStyle = createGridSpanStyles(span, colSpan, rowSpan)

  return { boxStyle, gridSpanStyle }
}
