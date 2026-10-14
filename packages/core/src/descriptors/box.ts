import { DEFAULT_CONFIG } from '../config/defaults'
import type { Padding } from '../types'

export type { BoxElement } from '../types'
import { compactStyle, formatValue, createGridSpanStyles } from '../utils'

export interface BoxDescriptorParams {
  base: number
  lineColor: string
  flatColor?: string
  width?: number | string
  height?: number | string
  span?: number
  colSpan?: number
  rowSpan?: number
  isVisible: boolean
  /** Resolved (initial or snapped) padding, placed as grid tracks. */
  padding: Padding
  /** Outline color for visible padding. */
  paddingColor: string
}

export interface BoxDescriptor {
  /** Size and color variables for the host; stylesheet defaults omitted. */
  boxStyle: Record<string, string>
  /** Grid columns that place the inline padding around the content. */
  spacingStyle: Record<string, string>
  /**
   * Margins that place the block padding around the content, which is its
   * grid's only row so every engine reads the text's baseline (issue #36).
   */
  contentStyle?: Record<string, string>
  /** Padding outline color and shaded band sizes, when debug paint is on. */
  paddingDebugStyle: Record<string, string>
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
  const {
    lineColor,
    flatColor,
    width,
    height,
    span,
    colSpan,
    rowSpan,
    isVisible,
    padding,
    paddingColor,
  } = params

  // Config is context, not a DOM wrapper. The consuming Box receives its
  // resolved colors directly so nested Config scopes do not depend on a
  // root-level custom property.
  const boxStyle = compactStyle(
    {
      ...(width !== undefined ? { '--bkbx-w': formatValue(width) } : {}),
      ...(height !== undefined ? { '--bkbx-h': formatValue(height) } : {}),
      '--bkbx-cl': lineColor,
      ...(flatColor !== undefined ? { '--bkbx-cf': flatColor } : {}),
    },
    {
      '--bkbx-w': 'fit-content',
      '--bkbx-h': 'fit-content',
      '--bkbx-cl': DEFAULT_CONFIG.box.colors.line,
      '--bkbx-cf': DEFAULT_CONFIG.box.colors.flat,
    }
  )

  const spacingStyle: Record<string, string> =
    padding.left > 0 || padding.right > 0
      ? { gridTemplateColumns: `${padding.left}px 1fr ${padding.right}px` }
      : {}

  const contentStyle: Record<string, string> =
    padding.top > 0 || padding.bottom > 0
      ? { marginBlock: `${padding.top}px ${padding.bottom}px` }
      : {}

  const paddingDebugStyle = isVisible
    ? compactStyle(
        {
          '--bkpd-c': paddingColor,
          '--bkpd-is': `${padding.top}px`,
          '--bkpd-ie': `${padding.bottom}px`,
        },
        {
          '--bkpd-c': DEFAULT_CONFIG.padder.color,
          '--bkpd-is': '0px',
          '--bkpd-ie': '0px',
        }
      )
    : {}

  const gridSpanStyle = createGridSpanStyles(span, colSpan, rowSpan)

  const classTokens = ['box']
  if (isVisible) classTokens.push('v')

  return {
    boxStyle,
    spacingStyle,
    contentStyle,
    paddingDebugStyle,
    gridSpanStyle,
    classTokens,
  }
}
