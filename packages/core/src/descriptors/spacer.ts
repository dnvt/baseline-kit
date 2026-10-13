import { DEFAULT_CONFIG } from '../config/defaults'
import { compactStyle, formatValue, normalizeValuePair } from '../utils'

/** Values the stylesheet already sets on `.bk-spr`. */
const SPACER_STYLE_DEFAULTS: Record<string, string> = {
  '--bksp-w': 'var(--bk-wf, 100%)',
  '--bksp-h': 'var(--bk-hf, auto)',
  '--bksp-cl': DEFAULT_CONFIG.spacer.colors.line,
  '--bksp-cf': DEFAULT_CONFIG.spacer.colors.flat,
  '--bksp-ct': DEFAULT_CONFIG.spacer.colors.text,
}

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
  /** Host style with stylesheet defaults omitted. */
  style: Record<string, string>
  normWidth: number
  normHeight: number
  classTokens: string[]
}

/**
 * Computes styles needed to render a Spacer component.
 * Pure function — framework-agnostic.
 */
export function createSpacerDescriptor(
  params: SpacerDescriptorParams
): SpacerDescriptor {
  const { base, colors, width, height, color, variant, isVisible } = params

  // A base of 1 means plain pixels: keep fractional sizes, such as the
  // snapped padding a Box passes to its spacers, instead of rounding them.
  const [normWidth, normHeight] = normalizeValuePair([width, height], [0, 0], {
    base,
    round: base > 1,
    suppressWarnings: true,
  })

  // Config is context, not a DOM wrapper, so resolved colors travel with
  // the consuming element unless the stylesheet already provides them.
  const style = compactStyle(
    {
      ...(height !== undefined ? { '--bksp-h': formatValue(normHeight) } : {}),
      ...(width !== undefined ? { '--bksp-w': formatValue(normWidth) } : {}),
      '--bksp-ct': color ?? colors.text,
      '--bksp-cl': color ?? colors.line,
      '--bksp-cf': color ?? colors.flat,
    },
    SPACER_STYLE_DEFAULTS
  )

  const classTokens = ['spr']
  if (isVisible) classTokens.push(variant)

  return { style, normWidth, normHeight, classTokens }
}
