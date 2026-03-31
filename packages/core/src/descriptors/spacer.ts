import { formatValue, createStyleOverride, normalizeValuePair } from '../utils'

export interface SpacerDescriptorParams {
  base: number
  colors: { line: string; flat: string; text: string }
  width?: number | string
  height?: number | string
  color?: string
  variant: string
  isVisible: boolean
}

export interface SpacerDescriptor {
  style: Record<string, string>
  normWidth: number
  normHeight: number
  classTokens: string[]
}

const SPACER_DEFAULTS = (base: number, textColor: string, flatColor: string, lineColor: string): Record<string, string> => ({
  '--bksp-w': '100%',
  '--bksp-h': '100%',
  '--bksp-b': `${base}px`,
  '--bksp-ct': textColor,
  '--bksp-cf': flatColor,
  '--bksp-cl': lineColor,
})

/**
 * Computes styles needed to render a Spacer component.
 * Pure function — framework-agnostic.
 */
export function createSpacerDescriptor(params: SpacerDescriptorParams): SpacerDescriptor {
  const { base, colors, width, height, color, variant, isVisible } = params

  const [normWidth, normHeight] = normalizeValuePair([width, height], [0, 0], { base, suppressWarnings: true })

  const defaultStyles = SPACER_DEFAULTS(base, colors.text, colors.flat, colors.line)
  const dimensionVars = ['--bksp-w', '--bksp-h']

  const style: Record<string, string> = {
    ...createStyleOverride({ key: '--bksp-h', value: formatValue(normHeight || '100%'), defaultStyles, skipDimensions: { fullSize: dimensionVars } }),
    ...createStyleOverride({ key: '--bksp-w', value: formatValue(normWidth || '100%'), defaultStyles, skipDimensions: { fullSize: dimensionVars } }),
    '--bksp-b': `${base}px`,
    ...createStyleOverride({ key: '--bksp-ct', value: color ?? colors.text, defaultStyles }),
    ...createStyleOverride({ key: '--bksp-cl', value: color ?? colors.line, defaultStyles }),
    ...createStyleOverride({ key: '--bksp-cf', value: color ?? colors.flat, defaultStyles }),
  }

  const classTokens = ['spr']
  if (isVisible) classTokens.push(variant)

  return { style, normWidth, normHeight, classTokens }
}
