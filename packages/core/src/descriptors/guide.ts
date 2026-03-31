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
  classTokens: string[]
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
  '--bkgd-w': 'auto',
  '--bkgd-h': 'auto',
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
export function createGuideDescriptor(params: GuideDescriptorParams): GuideDescriptor {
  const {
    base, colors, variant, align, width, height, columnWidth,
    maxWidth, color, containerWidth, containerHeight,
    template, columnsCount, calculatedGap, isVisible,
  } = params

  const defaultStyles = GUIDE_DEFAULTS(base, colors.line)
  const autoDimensions = ['--bkgd-w', '--bkgd-h']

  const widthValue = formatValue(width || containerWidth || 'auto')
  const heightValue = formatValue(height || containerHeight || 'auto')

  const containerStyle: Record<string, string> = {
    ...createStyleOverride({ key: '--bkgd-w', value: widthValue, defaultStyles, skipDimensions: { auto: autoDimensions } }),
    ...createStyleOverride({ key: '--bkgd-h', value: heightValue, defaultStyles, skipDimensions: { auto: autoDimensions } }),
    ...createStyleOverride({ key: '--bkgd-mw', value: formatValue(maxWidth || 'none'), defaultStyles }),
    ...createStyleOverride({ key: '--bkgd-cw', value: formatValue(columnWidth || '60px'), defaultStyles }),
    ...createStyleOverride({ key: '--bkgd-n', value: `${columnsCount}`, defaultStyles }),
    ...createStyleOverride({ key: '--bkgd-b', value: '0', defaultStyles }),
    ...createStyleOverride({ key: '--bkgd-cl', value: color ?? colors.line, defaultStyles }),
    ...createStyleOverride({ key: '--bkgd-g', value: `${calculatedGap}px`, defaultStyles }),
    ...createStyleOverride({ key: '--bkgd-j', value: align || 'center', defaultStyles }),
    ...(template && template !== 'none' ? { '--bkgd-t': template, gridTemplateColumns: template } : {}),
  }

  const columnColor = (variant && variant in colors
    ? colors[variant as keyof typeof colors]
    : undefined) ?? colors.line

  const isLineVariant = variant === 'line'
  const classTokens = ['gde', isVisible ? 'v' : 'h']
  if (isLineVariant) classTokens.push('line')

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
