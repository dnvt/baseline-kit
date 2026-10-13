import { DEFAULT_CONFIG } from '../config/defaults'
import {
  compactStyle,
  formatValue,
  isCSSLength,
  normalizeValuePair,
} from '../utils'

/** Values the stylesheet already sets on `.bk-spr`. */
const SPACER_STYLE_DEFAULTS: Record<string, string> = {
  '--bksp-w': 'var(--bk-wf, 100%)',
  '--bksp-h': 'var(--bk-hf, auto)',
  '--bksp-hl': 'initial',
  '--bksp-cl': DEFAULT_CONFIG.spacer.colors.line,
  '--bksp-cf': DEFAULT_CONFIG.spacer.colors.flat,
  '--bksp-ct': DEFAULT_CONFIG.spacer.colors.text,
}

export interface SpacerDescriptorParams {
  base: number
  /**
   * The base in rem when it follows the root font size (`Config base` in
   * rem); string heights then round to it in CSS.
   */
  baseRem?: number
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
  /** Width in px against a 16px root (7.0's value; a string width renders as written). */
  normWidth: number
  /** Height in px against a 16px root: the fallback for a string height. */
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
  const { base, baseRem, colors, width, height, color, variant, isVisible } =
    params

  // A base of 1 means plain pixels: keep fractional sizes, such as the
  // snapped padding a Box passes to its spacers, instead of rounding them.
  const [normWidth, normHeight] = normalizeValuePair([width, height], [0, 0], {
    base,
    round: base > 1,
    suppressWarnings: true,
  })

  // A CSS length string stays live: the browser resolves it against the
  // current root font size, viewport and container. A height still rounds
  // to the base, in CSS; where round() is unsupported the stylesheet keeps
  // the px value above. A width renders as written. Other strings keep the
  // px resolution.
  const liveHeight =
    typeof height === 'string' && isCSSLength(height) ? height.trim() : null
  const liveWidth =
    typeof width === 'string' && isCSSLength(width) ? width.trim() : null
  const step = baseRem !== undefined ? `${baseRem}rem` : `${base}px`

  // Config is context, not a DOM wrapper, so resolved colors travel with
  // the consuming element unless the stylesheet already provides them.
  const style = compactStyle(
    {
      ...(height !== undefined ? { '--bksp-h': formatValue(normHeight) } : {}),
      ...(liveHeight !== null
        ? {
            '--bksp-hl':
              base > 1 ? `round(nearest, ${liveHeight}, ${step})` : liveHeight,
          }
        : {}),
      ...(width !== undefined
        ? { '--bksp-w': liveWidth ?? formatValue(normWidth) }
        : {}),
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
