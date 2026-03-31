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
  containerWidth: number
  containerHeight: number
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
}

/**
 * Creates a GuideConfig from component props.
 * Pure function — no React or DOM dependency.
 */
export function createGuideConfig(
  variant: GuideVariant,
  base: number,
  gap: number,
  columns?: number | readonly (string | number | undefined | 'auto')[],
  columnWidth?: number | string,
): GuideConfig {
  switch (variant) {
    case 'line':
      return { variant: 'line', gap, base }
    case 'pattern':
      if (columns && Array.isArray(columns)) {
        return { variant: 'pattern', columns: columns as readonly (string | number)[], gap, base }
      }
      break
    case 'fixed':
      if (columns !== undefined) {
        const parsed = typeof columns === 'number' ? columns : parseInt(String(columns), 10)
        return { variant: 'fixed', columns: !isNaN(parsed) ? parsed : 12, columnWidth: columnWidth || '60px', gap, base }
      }
      break
  }
  return { variant: 'auto', columnWidth: columnWidth || '1fr', gap, base }
}

const GUIDE_DEFAULTS = (base: number, lineColor: string): Record<string, string> => ({
  '--bkgw': 'auto',
  '--bkgh': 'auto',
  '--bkgmw': 'none',
  '--bkgcw': '60px',
  '--bkggw': '24px',
  '--bkgc': '12',
  '--bkgb': `${base}px`,
  '--bkgcl': lineColor,
  '--bkgg': '0',
})

/**
 * Computes all styles and data needed to render a Guide component.
 * Pure function — framework-agnostic.
 */
export function createGuideDescriptor(params: GuideDescriptorParams): GuideDescriptor {
  const {
    base, colors, variant, align, width, height, columnWidth,
    maxWidth, color, containerWidth, containerHeight,
    template, columnsCount, calculatedGap, isVisible,
  } = params

  const defaultStyles = GUIDE_DEFAULTS(base, colors.line)
  const autoDimensions = ['--bkgw', '--bkgh']

  const widthValue = formatValue(width || containerWidth || 'auto')
  const heightValue = formatValue(height || containerHeight || 'auto')

  const containerStyle: Record<string, string> = {
    ...createStyleOverride({ key: '--bkgw', value: widthValue, defaultStyles, skipDimensions: { auto: autoDimensions } }),
    ...createStyleOverride({ key: '--bkgh', value: heightValue, defaultStyles, skipDimensions: { auto: autoDimensions } }),
    ...createStyleOverride({ key: '--bkgmw', value: formatValue(maxWidth || 'none'), defaultStyles }),
    ...createStyleOverride({ key: '--bkgcw', value: formatValue(columnWidth || '60px'), defaultStyles }),
    ...createStyleOverride({ key: '--bkgc', value: `${columnsCount}`, defaultStyles }),
    ...createStyleOverride({ key: '--bkgb', value: '0', defaultStyles }),
    ...createStyleOverride({ key: '--bkgcl', value: color ?? colors.line, defaultStyles }),
    ...createStyleOverride({ key: '--bkgg', value: `${calculatedGap}px`, defaultStyles }),
    ...createStyleOverride({ key: '--bkgj', value: align || 'center', defaultStyles }),
    ...(template && template !== 'none' ? { '--bkgt': template, gridTemplateColumns: template } : {}),
  }

  const columnColor = (variant && variant in colors
    ? colors[variant as keyof typeof colors]
    : undefined) ?? colors.line

  return {
    containerStyle,
    columnColor,
    columnsCount,
    calculatedGap,
    template,
    isVisible,
    isLineVariant: variant === 'line',
  }
}
