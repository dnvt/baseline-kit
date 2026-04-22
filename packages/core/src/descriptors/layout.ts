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
  classTokens: string[]
}

const LAYOUT_DEFAULTS = (colors: {
  line: string
  flat: string
  text: string
}) => ({
  '--bkly-w': 'auto',
  '--bkly-h': 'auto',
  '--bkly-cl': colors.line,
  '--bkly-cf': colors.flat,
  '--bkly-ct': colors.text,
})

/**
 * Parses grid template definitions into CSS grid-template values.
 * Pure function — framework-agnostic.
 */
export function getGridTemplate(
  prop?: number | string | Array<number | string>
): string {
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
export function createLayoutDescriptor(
  params: LayoutDescriptorParams
): LayoutDescriptor {
  const {
    colors,
    columns,
    rows,
    width,
    height,
    gap,
    rowGap,
    columnGap,
    justifyItems,
    alignItems,
    justifyContent,
    alignContent,
  } = params

  const defaultStyles = LAYOUT_DEFAULTS(colors)
  const autoDimensions = ['--bkly-w', '--bkly-h']

  const gridTemplateColumns = getGridTemplate(columns)
  const gridTemplateRows = rows ? getGridTemplate(rows) : 'auto'

  const gapStyles: Record<string, string> = {}
  if (gap !== undefined) gapStyles.gap = formatValue(gap)
  if (rowGap !== undefined) gapStyles.rowGap = formatValue(rowGap)
  if (columnGap !== undefined) gapStyles.columnGap = formatValue(columnGap)

  // --bkly-cl / --bkly-cf / --bkly-ct intentionally omitted: their runtime
  // value equals the default (both derived from the same `colors` input that
  // seeds LAYOUT_DEFAULTS), so inline overrides would never emit. Styling
  // lands at the CSS layer via the module's declared defaults.
  const containerStyle: Record<string, string> = {
    ...createStyleOverride({
      key: '--bkly-w',
      value: formatValue(width || 'auto'),
      defaultStyles,
      skipDimensions: { auto: autoDimensions },
    }),
    ...createStyleOverride({
      key: '--bkly-h',
      value: formatValue(height || 'auto'),
      defaultStyles,
      skipDimensions: { auto: autoDimensions },
    }),
    ...(gridTemplateColumns !== DEFAULT_GRID_TEMPLATE
      ? { '--bkly-gtc': gridTemplateColumns }
      : {}),
    ...(gridTemplateRows !== 'auto' ? { '--bkly-gtr': gridTemplateRows } : {}),
    ...(justifyItems ? { '--bkly-ji': justifyItems } : {}),
    ...(alignItems ? { '--bkly-ai': alignItems } : {}),
    ...(justifyContent ? { '--bkly-jc': justifyContent } : {}),
    ...(alignContent ? { '--bkly-ac': alignContent } : {}),
    ...gapStyles,
  }

  return { containerStyle, classTokens: ['lay'] }
}
