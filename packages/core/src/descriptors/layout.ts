import { formatValue, createStyleOverride } from '../utils'

export interface LayoutDescriptorParams {
  colors: { line: string; flat: string; text: string }
  columns?: number | string | Array<number | string>
  rows?: number | string | Array<number | string>
  width?: number | string
  height?: number | string
  gap?: number | string
  rowGap?: number | string
  columnGap?: number | string
  justifyItems?: string
  alignItems?: string
  justifyContent?: string
  alignContent?: string
}

export interface LayoutDescriptor {
  containerStyle: Record<string, string>
}

const LAYOUT_DEFAULTS = (colors: { line: string; flat: string; text: string }) => ({
  '--bklw': 'auto',
  '--bklh': 'auto',
  '--bklcl': colors.line,
  '--bklcf': colors.flat,
  '--bklci': colors.text,
})

/**
 * Parses grid template definitions into CSS grid-template values.
 * Pure function — framework-agnostic.
 */
export function getGridTemplate(prop?: number | string | Array<number | string>): string {
  if (typeof prop === 'number') return `repeat(${prop}, 1fr)`
  if (typeof prop === 'string') return prop
  if (Array.isArray(prop)) {
    return prop.map((p) => (typeof p === 'number' ? `${p}px` : p)).join(' ')
  }
  return DEFAULT_GRID_TEMPLATE
}

const DEFAULT_GRID_TEMPLATE = 'repeat(auto-fill, minmax(100px, 1fr))'

/**
 * Computes styles needed to render a Layout component.
 * Pure function — framework-agnostic.
 */
export function createLayoutDescriptor(params: LayoutDescriptorParams): LayoutDescriptor {
  const { colors, columns, rows, width, height, gap, rowGap, columnGap, justifyItems, alignItems, justifyContent, alignContent } = params

  const defaultStyles = LAYOUT_DEFAULTS(colors)
  const autoDimensions = ['--bklw', '--bklh']

  const gridTemplateColumns = getGridTemplate(columns)
  const gridTemplateRows = rows ? getGridTemplate(rows) : 'auto'

  const gapStyles: Record<string, string> = {}
  if (gap !== undefined) gapStyles.gap = formatValue(gap)
  if (rowGap !== undefined) gapStyles.rowGap = formatValue(rowGap)
  if (columnGap !== undefined) gapStyles.columnGap = formatValue(columnGap)

  const containerStyle: Record<string, string> = {
    ...createStyleOverride({ key: '--bklw', value: formatValue(width || 'auto'), defaultStyles, skipDimensions: { auto: autoDimensions } }),
    ...createStyleOverride({ key: '--bklh', value: formatValue(height || 'auto'), defaultStyles, skipDimensions: { auto: autoDimensions } }),
    ...createStyleOverride({ key: '--bklcl', value: colors.line, defaultStyles }),
    ...createStyleOverride({ key: '--bklcf', value: colors.flat, defaultStyles }),
    ...createStyleOverride({ key: '--bklci', value: colors.text, defaultStyles }),
    ...(gridTemplateColumns !== DEFAULT_GRID_TEMPLATE ? { '--bklgtc': gridTemplateColumns } : {}),
    ...(gridTemplateRows !== 'auto' ? { '--bklgtr': gridTemplateRows } : {}),
    ...(justifyItems ? { '--bklji': justifyItems } : {}),
    ...(alignItems ? { '--bklai': alignItems } : {}),
    ...(justifyContent ? { '--bkljc': justifyContent } : {}),
    ...(alignContent ? { '--bklac': alignContent } : {}),
    ...gapStyles,
  }

  return { containerStyle }
}
