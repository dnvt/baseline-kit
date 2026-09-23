import type { GuideVariant, GuideConfig } from '../types'
import { formatValue, createStyleOverride } from '../utils'

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
  gap: number
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
  gap: number
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

const GUIDE_DEFAULTS = (
  base: number,
  lineColor: string
): Record<string, string> => ({
  '--bkgd-w': '100%',
  '--bkgd-h': '100%',
  '--bkgd-mw': 'none',
  '--bkgd-cw': '60px',
  '--bkgd-gw': '24px',
  '--bkgd-n': '12',
  '--bkgd-b': `${base}px`,
  '--bkgd-cl': lineColor,
  '--bkgd-g': '0',
})

/**
 * Computes all styles and data needed to render a Guide component.
 * Pure function — framework-agnostic.
 */
export function createGuideDescriptor(
  params: GuideDescriptorParams
): GuideDescriptor {
  const {
    base,
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

  const defaultStyles = GUIDE_DEFAULTS(base, colors.line)
  const containerStyle: Record<string, string> = {
    // Config is wrapperless, so every guide color channel must travel with
    // the consuming guide rather than relying on root CSS variables.
    '--bkgd-cl': color ?? colors.line,
    '--bkgd-cp': color ?? colors.pattern,
    '--bkgd-ca': color ?? colors.auto,
    '--bkgd-cf': color ?? colors.fixed,
    // Always declare the containing-block default and preserve explicit CSS
    // dimensions. A viewport size is not equivalent to 100% of the parent.
    '--bkgd-w': formatValue(width ?? '100%'),
    '--bkgd-h': formatValue(height ?? '100%'),
    ...createStyleOverride({
      key: '--bkgd-mw',
      value: formatValue(maxWidth || 'none'),
      defaultStyles,
    }),
    ...createStyleOverride({
      key: '--bkgd-cw',
      value: formatValue(columnWidth || '60px'),
      defaultStyles,
    }),
    ...createStyleOverride({
      key: '--bkgd-n',
      value: `${columnsCount}`,
      defaultStyles,
    }),
    ...createStyleOverride({ key: '--bkgd-b', value: '0', defaultStyles }),
    ...createStyleOverride({
      key: '--bkgd-cl',
      value: color ?? colors.line,
      defaultStyles,
    }),
    ...createStyleOverride({
      key: '--bkgd-g',
      value: `${calculatedGap}px`,
      defaultStyles,
    }),
    ...createStyleOverride({
      key: '--bkgd-j',
      value: align || 'center',
      defaultStyles,
    }),
    // CSS module resolves grid-template-columns from --bkgd-t, so the inline
    // gridTemplateColumns property would be redundant.
    ...(template && template !== 'none' ? { '--bkgd-t': template } : {}),
  }

  const columnColor =
    color ??
    (variant && variant in colors
      ? colors[variant as keyof typeof colors]
      : undefined) ??
    colors.line

  const isLineVariant = variant === 'line'
  const classTokens = ['gde', isVisible ? 'v' : 'h']
  if (isLineVariant) classTokens.push('line')

  if (isLineVariant) {
    containerStyle['--bkgd-line-color'] = 'var(--bkgd-cl)'
    containerStyle['--bkgd-line-period'] = `${calculatedGap + 1}px`
  }

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
