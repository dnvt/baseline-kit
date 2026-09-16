import { formatValue, normalizeValuePair } from '../utils'

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

/**
 * Computes styles needed to render a Spacer component.
 * Pure function — framework-agnostic.
 */
export function createSpacerDescriptor(
  params: SpacerDescriptorParams
): SpacerDescriptor {
  const { base, colors, width, height, color, variant, isVisible } = params

  const [normWidth, normHeight] = normalizeValuePair([width, height], [0, 0], {
    base,
    suppressWarnings: true,
  })

  const style: Record<string, string> = {
    ...(height !== undefined ? { '--bksp-h': formatValue(normHeight) } : {}),
    ...(width !== undefined ? { '--bksp-w': formatValue(normWidth) } : {}),
    '--bksp-b': `${base}px`,
    // Emit all resolved painted channels on the consumer. Config is
    // wrapperless, so comparing against defaults would erase custom values.
    '--bksp-ct': color ?? colors.text,
    '--bksp-cl': color ?? colors.line,
    '--bksp-cf': color ?? colors.flat,
  }

  const classTokens = ['spr']
  if (isVisible) classTokens.push(variant)

  return { style, normWidth, normHeight, classTokens }
}
