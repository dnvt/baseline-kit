import { formatValue, createStyleOverride, normalizeValuePair } from '../utils'

export interface SpacerDescriptorParams {
  base: number
  colors: { line: string; flat: string; text: string }
  width?: number | string
  height?: number | string
  color?: string
}

export interface SpacerDescriptor {
  style: Record<string, string>
  normWidth: number
  normHeight: number
}

const SPACER_DEFAULTS = (base: number, textColor: string, flatColor: string, lineColor: string): Record<string, string> => ({
  '--bksw': '100%',
  '--bksh': '100%',
  '--bksb': `${base}px`,
  '--bksct': textColor,
  '--bkscf': flatColor,
  '--bkscl': lineColor,
})

/**
 * Computes styles needed to render a Spacer component.
 * Pure function — framework-agnostic.
 */
export function createSpacerDescriptor(params: SpacerDescriptorParams): SpacerDescriptor {
  const { base, colors, width, height, color } = params

  const [normWidth, normHeight] = normalizeValuePair([width, height], [0, 0], { base, suppressWarnings: true })

  const defaultStyles = SPACER_DEFAULTS(base, colors.text, colors.flat, colors.line)
  const dimensionVars = ['--bksw', '--bksh']

  const style: Record<string, string> = {
    ...createStyleOverride({ key: '--bksh', value: formatValue(normHeight || '100%'), defaultStyles, skipDimensions: { fullSize: dimensionVars } }),
    ...createStyleOverride({ key: '--bksw', value: formatValue(normWidth || '100%'), defaultStyles, skipDimensions: { fullSize: dimensionVars } }),
    '--bksb': `${base}px`,
    ...createStyleOverride({ key: '--bksct', value: color ?? colors.text, defaultStyles }),
    ...createStyleOverride({ key: '--bkscl', value: color ?? colors.line, defaultStyles }),
    ...createStyleOverride({ key: '--bkscf', value: color ?? colors.flat, defaultStyles }),
  }

  return { style, normWidth, normHeight }
}
