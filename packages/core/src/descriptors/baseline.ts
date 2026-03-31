import type { BaselineVariant } from '../types'
import {
  formatValue,
  createStyleOverride,
  normalizeValuePair,
  parsePadding,
  calculateRowCount,
} from '../utils'

export interface BaselineDescriptorParams {
  base: number
  colors: Record<BaselineVariant, string>
  variant: BaselineVariant
  width?: number | string
  height?: number | string
  color?: string
  containerWidth: number
  containerHeight: number
  spacing: Record<string, unknown>
  isVisible: boolean
}

export interface BaselineDescriptor {
  containerStyle: Record<string, string>
  rowCount: number
  getRowStyle: (index: number) => Record<string, string>
  padding: string | undefined
  isVisible: boolean
  classTokens: string[]
}

const BASELINE_DEFAULTS = (
  base: number,
  lineColor: string,
  flatColor: string
): Record<string, string> => ({
  '--bkbl-w': '100%',
  '--bkbl-h': '100%',
  '--bkbl-b': `${base}px`,
  '--bkbl-cl': lineColor,
  '--bkbl-cf': flatColor,
})

/**
 * Computes all styles and data needed to render a Baseline component.
 * Pure function — framework-agnostic.
 */
export function createBaselineDescriptor(
  params: BaselineDescriptorParams
): BaselineDescriptor {
  const {
    base,
    colors,
    variant,
    width,
    height,
    color,
    containerWidth,
    containerHeight,
    spacing,
    isVisible,
  } = params

  const [, normHeight] = normalizeValuePair(
    [width, height],
    [containerWidth, containerHeight]
  )
  const { top, right, bottom, left } = parsePadding(spacing)

  const paddingValues = [top, right, bottom, left]
    .map((v) => (v ? `${v}px` : '0'))
    .join(' ')
  const padding = paddingValues !== '0 0 0 0' ? paddingValues : undefined

  const rowCount = calculateRowCount({ height: normHeight, top, bottom, base })

  const chosenColor = color || (variant === 'line' ? colors.line : colors.flat)

  const defaultStyles = BASELINE_DEFAULTS(base, colors.line, colors.flat)
  const dimensionVars = ['--bkbl-w', '--bkbl-h']

  const containerStyle: Record<string, string> = {
    ...createStyleOverride({
      key: '--bkbl-w',
      value: formatValue(width || '100%'),
      defaultStyles,
      skipDimensions: { fullSize: dimensionVars },
    }),
    ...createStyleOverride({
      key: '--bkbl-h',
      value: formatValue(height || '100%'),
      defaultStyles,
      skipDimensions: { fullSize: dimensionVars },
    }),
    ...createStyleOverride({
      key: '--bkbl-b',
      value: `${base}px`,
      defaultStyles,
    }),
    ...createStyleOverride({
      key: '--bkbl-cl',
      value: color || colors.line,
      defaultStyles,
    }),
    ...createStyleOverride({
      key: '--bkbl-cf',
      value: color || colors.flat,
      defaultStyles,
    }),
    ...(padding ? { padding } : {}),
  }

  const getRowStyle = (index: number): Record<string, string> => ({
    '--bkbl-rt': index === 0 ? '0px' : `${index * base}px`,
    '--bkbl-rh': variant === 'line' ? '1px' : `${base}px`,
    '--bkbl-c': chosenColor,
  })

  const classTokens = ['bas', isVisible ? 'v' : 'h']

  return {
    containerStyle,
    rowCount,
    getRowStyle,
    padding,
    isVisible,
    classTokens,
  }
}
