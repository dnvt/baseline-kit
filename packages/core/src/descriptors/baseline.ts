import type { BaselineVariant } from '../types'
import {
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

  const containerStyle: Record<string, string> = {
    // Preserve explicit dimensions verbatim. In particular, `100vh`,
    // `100vw`, `calc(...)`, and zero must not be collapsed to the 100% CSS
    // fallback.
    ...(width !== undefined ? { '--bkbl-w': formatValue(width) } : {}),
    ...(height !== undefined ? { '--bkbl-h': formatValue(height) } : {}),
    // Config is wrapperless. Emit the resolved paint channels on the
    // consuming element even when they happen to match the descriptor's
    // defaults; CSS variables on an ancestor cannot express nested scopes.
    '--bkbl-cl': color ?? colors.line,
    '--bkbl-cf': color ?? colors.flat,
    // Rows inherit the active channel. Keeping this as a reference rather
    // than a copied literal preserves caller style overrides on the host.
    '--bkbl-c': variant === 'line' ? 'var(--bkbl-cl)' : 'var(--bkbl-cf)',
    ...(padding ? { padding } : {}),
  }

  const getRowStyle = (index: number): Record<string, string> => ({
    '--bkbl-rt': index === 0 ? '0px' : `${index * base}px`,
    '--bkbl-rh': variant === 'line' ? '1px' : `${base}px`,
  })

  const classTokens = ['bas', isVisible ? 'v' : 'h']

  return {
    containerStyle,
    rowCount,
    contentHeight,
    getRowStyle,
    padding,
    isVisible,
    classTokens,
  }
}
