import {
  formatValue,
  createStyleOverride,
  createGridSpanStyles,
} from '../utils'

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

const BOX_DEFAULTS = (
  base: number,
  lineColor: string
): Record<string, string> => ({
  '--bkbx-w': 'auto',
  '--bkbx-h': 'auto',
  '--bkbx-cl': lineColor,
  '--bkbx-b': `${base}px`,
})

/**
 * Computes styles needed to render a Box component.
 * Pure function — framework-agnostic.
 */
export function createBoxDescriptor(
  params: BoxDescriptorParams
): BoxDescriptor {
  const { base, lineColor, width, height, span, colSpan, rowSpan, isVisible } =
    params

  const defaultStyles = BOX_DEFAULTS(base, lineColor)
  const dimensionVars = ['--bkbx-w', '--bkbx-h']

  // --bkbx-b and --bkbx-cl intentionally omitted: their runtime value
  // always equals the default (both are derived from the same base/lineColor
  // inputs that seed BOX_DEFAULTS), so inline overrides would never emit.
  // Styling happens at the CSS layer via the module's declared defaults.
  const boxStyle: Record<string, string> = {
    ...createStyleOverride({
      key: '--bkbx-w',
      value: formatValue(width || 'fit-content'),
      defaultStyles,
      skipDimensions: { fitContent: dimensionVars },
    }),
    ...createStyleOverride({
      key: '--bkbx-h',
      value: formatValue(height || 'fit-content'),
      defaultStyles,
      skipDimensions: { fitContent: dimensionVars },
    }),
  }

  const gridSpanStyle = createGridSpanStyles(span, colSpan, rowSpan)

  const classTokens = ['box']
  if (isVisible) classTokens.push('v')

  return { boxStyle, gridSpanStyle, classTokens }
}
