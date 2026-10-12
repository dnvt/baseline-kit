import { DEFAULT_CONFIG } from '../config/defaults'
import type { BaselineVariant } from '../types'
import {
  compactStyle,
  formatValue,
  normalizeValuePair,
  parsePadding,
  calculateRowCount,
} from '../utils'

export function canCompactBaselinePaint(params: {
  base: number
  contentHeight: number
  domDiagnostics: boolean
  className?: string
  style?: object
}): boolean {
  if (
    params.domDiagnostics ||
    params.base <= 1 ||
    !Number.isInteger(params.base) ||
    params.className
  ) {
    return false
  }

  if (
    params.contentHeight >= params.base &&
    Math.abs(
      params.contentHeight -
        Math.floor(params.contentHeight / params.base) * params.base
    ) > 0.001
  ) {
    return false
  }

  return !Object.keys(params.style ?? {}).some(
    (property) => property.startsWith('background') || property === '--bkbl-b'
  )
}

/** Values the stylesheet already sets on `.bk-bas`. */
const BASELINE_STYLE_DEFAULTS: Record<string, string> = {
  '--bkbl-w': '100%',
  '--bkbl-h': '100%',
  '--bkbl-b': '8px',
  '--bkbl-cl': DEFAULT_CONFIG.baseline.colors.line,
  '--bkbl-cf': DEFAULT_CONFIG.baseline.colors.flat,
}

/**
 * Size-only style for the hidden server fallback rendered before the
 * browser can measure the overlay.
 */
export function createBaselineFallbackStyle(
  width?: number | string,
  height?: number | string
): Record<string, string> {
  return compactStyle(
    {
      ...(width !== undefined ? { '--bkbl-w': formatValue(width) } : {}),
      ...(height !== undefined ? { '--bkbl-h': formatValue(height) } : {}),
    },
    BASELINE_STYLE_DEFAULTS
  )
}

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
  domDiagnostics: boolean
  className?: string
  style?: object
}

export interface BaselineDescriptor {
  /** Host style with stylesheet defaults omitted. */
  containerStyle: Record<string, string>
  /** Paint rows with one CSS gradient instead of one element per row. */
  compactPaint: boolean
  rowCount: number
  contentHeight: number
  getRowStyle: (index: number) => Record<string, string>
  padding: string | undefined
  isVisible: boolean
  classTokens: string[]
}

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
    domDiagnostics,
    className,
    style,
  } = params

  const { top, right, bottom, left } = parsePadding(spacing)

  const paddingValues = [top, right, bottom, left]
    .map((v) => (v ? `${v}px` : '0'))
    .join(' ')
  const padding = paddingValues !== '0 0 0 0' ? paddingValues : undefined

  // The browser resolves declared CSS dimensions. A non-zero measured
  // rectangle is therefore the only reliable height for deciding how many
  // baseline rows are needed; normalizing `height` here incorrectly treats
  // relative values as if they were pixel values in a synthetic conversion
  // context. The fallback only supports DOM-less test/SSR environments before
  // the first layout measurement arrives.
  const layoutHeight =
    containerHeight > 0
      ? containerHeight
      : normalizeValuePair([undefined, height], [containerWidth, 0])[1]
  const contentHeight = layoutHeight - top - bottom
  const rowCount = calculateRowCount({
    height: layoutHeight,
    top,
    bottom,
    base,
  })

  const compactPaint = canCompactBaselinePaint({
    base,
    contentHeight,
    domDiagnostics,
    className,
    style,
  })

  // Preserve explicit dimensions verbatim: `100vh`, `calc(...)`, and zero
  // must not collapse to the 100% default. Config is context, not a DOM
  // wrapper, so resolved colors travel with the consuming element.
  const containerStyle = compactStyle(
    {
      ...(width !== undefined ? { '--bkbl-w': formatValue(width) } : {}),
      ...(height !== undefined ? { '--bkbl-h': formatValue(height) } : {}),
      ...(compactPaint ? { '--bkbl-b': `${base}px` } : {}),
      '--bkbl-cl': color ?? colors.line,
      '--bkbl-cf': color ?? colors.flat,
      ...(padding ? { padding } : {}),
    },
    BASELINE_STYLE_DEFAULTS
  )

  const getRowStyle = (index: number): Record<string, string> => ({
    '--bkbl-rt': index === 0 ? '0px' : `${index * base}px`,
    '--bkbl-rh': variant === 'line' ? '1px' : `${base}px`,
  })

  const classTokens = ['bas', isVisible ? 'v' : 'h', variant]
  if (compactPaint) classTokens.push('compact')

  return {
    containerStyle,
    compactPaint,
    rowCount,
    contentHeight,
    getRowStyle,
    padding,
    isVisible,
    classTokens,
  }
}
