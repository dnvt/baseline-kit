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

const MERGED_BOX_SAFE_STYLES = new Set([
  'background',
  'backgroundColor',
  'boxShadow',
  'color',
  'cursor',
  'opacity',
  'outline',
  'outlineColor',
  'outlineOffset',
  'outlineStyle',
  'outlineWidth',
  'pointerEvents',
  'textDecoration',
  'textShadow',
  'visibility',
])

export function requiresSeparatePadder(params: {
  className?: string
  style?: object
  width?: number | string
}): boolean {
  if (params.className) return true
  // Box width historically applies to the outer frame while its Padder stays
  // fit-content. An explicit non-default width therefore needs both hosts.
  if (params.width !== undefined && params.width !== 'fit-content') return true
  if (!params.style) return false

  // The merged Box is also the Padder grid. Only merge with style overrides
  // that cannot affect track sizing; arbitrary/unknown styles keep the old
  // separate Padder host so caller CSS retains its original target.
  return Object.keys(params.style).some(
    (property) => !MERGED_BOX_SAFE_STYLES.has(property)
  )
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
