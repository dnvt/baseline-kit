import { DEFAULT_CONFIG } from '../config/defaults'
import type { GuideVariant, GuideConfig } from '../types'
import { compactStyle, formatValue } from '../utils'

/** Values the stylesheet already sets on `.bk-gde`. */
const GUIDE_STYLE_DEFAULTS: Record<string, string> = {
  '--bkgd-w': '100%',
  '--bkgd-h': '100%',
  '--bkgd-mw': 'none',
  '--bkgd-cw': '60px',
  '--bkgd-n': '12',
  '--bkgd-cl': DEFAULT_CONFIG.guide.colors.line,
  '--bkgd-cp': DEFAULT_CONFIG.guide.colors.pattern,
  '--bkgd-ca': DEFAULT_CONFIG.guide.colors.auto,
  '--bkgd-cf': DEFAULT_CONFIG.guide.colors.fixed,
  '--bkgd-g': '0px',
  '--bkgd-j': 'center',
  '--bkgd-t': 'none',
}

/**
 * Size-only style for the hidden server fallback rendered before the
 * browser can measure the overlay.
 */
export function createGuideFallbackStyle(
  width?: number | string,
  height?: number | string,
  maxWidth?: number | string
): Record<string, string> {
  return compactStyle(
    {
      ...(width !== undefined ? { '--bkgd-w': formatValue(width) } : {}),
      ...(height !== undefined ? { '--bkgd-h': formatValue(height) } : {}),
      ...(maxWidth !== undefined ? { '--bkgd-mw': formatValue(maxWidth) } : {}),
    },
    GUIDE_STYLE_DEFAULTS
  )
}

export interface GuideDescriptorParams {
  base: number
  colors: Record<GuideVariant, string>
  variant: GuideVariant
  align: string
  width?: number | string
  height?: number | string
  columnWidth?: number | string
  maxWidth?: number | string
  color?: string
  /** Pre-computed guide template result (from useGuide or calculateGuideTemplate) */
  template: string
  columnsCount: number
  calculatedGap: number
  isVisible: boolean
}

export interface GuideDescriptor {
  /** Host style with stylesheet defaults omitted. */
  containerStyle: Record<string, string>
  columnColor: string
  columnsCount: number
  calculatedGap: number
  template: string
  isVisible: boolean
  isLineVariant: boolean
  classTokens: string[]
}

export function canCompactFixedGuide(params: {
  variant: GuideVariant
  columns?: number | readonly unknown[]
  columnWidth?: number | string
  gap: number | string
  align?: string
  domDiagnostics: boolean
  className?: string
  style?: object
}): boolean {
  const colorOverrides = new Set([
    '--bkgd-cl',
    '--bkgd-cp',
    '--bkgd-ca',
    '--bkgd-cf',
    '--bkgd-line-color',
  ])
  const hasLayoutStyle =
    params.style &&
    Object.keys(params.style).some((property) => !colorOverrides.has(property))

  return (
    !params.domDiagnostics &&
    !params.className &&
    !hasLayoutStyle &&
    params.variant === 'fixed' &&
    params.columns === 4 &&
    (params.columnWidth === undefined ||
      params.columnWidth === 60 ||
      params.columnWidth === '60px') &&
    params.gap === 0 &&
    (params.align || 'center') === 'center'
  )
}

export interface GuideConfigParams {
  variant: GuideVariant
  base: number
  gap: number | string
  columns?: number | readonly (string | number | undefined | 'auto')[]
  columnWidth?: number | string
}

/**
 * Creates a GuideConfig from component props.
 * Pure function — no React or DOM dependency.
 */
export function createGuideConfig({
  variant,
  base,
  gap,
  columns,
  columnWidth,
}: GuideConfigParams): GuideConfig {
  switch (variant) {
    case 'line':
      return { variant: 'line', gap, base }
    case 'pattern':
      if (columns && Array.isArray(columns)) {
        return {
          variant: 'pattern',
          columns: columns as readonly (string | number)[],
          gap,
          base,
        }
      }
      break
    case 'fixed':
      if (columns !== undefined) {
        const parsed =
          typeof columns === 'number' ? columns : parseInt(String(columns), 10)
        return {
          variant: 'fixed',
          columns: !isNaN(parsed) ? parsed : 12,
          columnWidth: columnWidth || '60px',
          gap,
          base,
        }
      }
      break
  }
  return { variant: 'auto', columnWidth: columnWidth || '1fr', gap, base }
}

/**
 * Computes all styles and data needed to render a Guide component.
 * Pure function — framework-agnostic.
 */
export function createGuideDescriptor(
  params: GuideDescriptorParams
): GuideDescriptor {
  const {
    colors,
    variant,
    align,
    width,
    height,
    columnWidth,
    maxWidth,
    color,
    template,
    columnsCount,
    calculatedGap,
    isVisible,
  } = params

  const isLineVariant = variant === 'line'

  // Config is context, not a DOM wrapper, so resolved colors travel with the
  // consuming element. The stylesheet resolves grid-template-columns from
  // --bkgd-t.
  const containerStyle = compactStyle(
    {
      '--bkgd-cl': color ?? colors.line,
      '--bkgd-cp': color ?? colors.pattern,
      '--bkgd-ca': color ?? colors.auto,
      '--bkgd-cf': color ?? colors.fixed,
      '--bkgd-w': formatValue(width ?? '100%'),
      '--bkgd-h': formatValue(height ?? '100%'),
      '--bkgd-mw': formatValue(maxWidth || 'none'),
      '--bkgd-cw': formatValue(columnWidth || '60px'),
      '--bkgd-n': `${columnsCount}`,
      '--bkgd-g': `${calculatedGap}px`,
      '--bkgd-j': align || 'center',
      ...(template ? { '--bkgd-t': template } : {}),
      ...(isLineVariant
        ? { '--bkgd-line-period': `${calculatedGap + 1}px` }
        : {}),
    },
    GUIDE_STYLE_DEFAULTS
  )

  const columnColor =
    color ??
    (variant && variant in colors
      ? colors[variant as keyof typeof colors]
      : undefined) ??
    colors.line

  const classTokens = ['gde', isVisible ? 'v' : 'h', variant]

  return {
    containerStyle,
    columnColor,
    columnsCount,
    calculatedGap,
    template,
    isVisible,
    isLineVariant,
    classTokens,
  }
}
