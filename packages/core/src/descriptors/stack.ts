import { formatValue, createStyleOverride } from '../utils'

const DIRECTION_AXIS: Record<string, string> = {
  x: 'row',
  y: 'column',
  '-x': 'row-reverse',
  '-y': 'column-reverse',
}

export interface StackDescriptorParams {
  colors: { line: string; flat: string; text: string }
  direction: string
  justify: string
  align: string
  width?: number | string
  height?: number | string
  gap?: number
  rowGap?: number
  columnGap?: number
  isVisible: boolean
}

export interface StackDescriptor {
  containerStyle: Record<string, string>
  classTokens: string[]
}

const STACK_DEFAULTS = (colors: {
  line: string
  flat: string
  text: string
}) => ({
  '--bksk-w': 'auto',
  '--bksk-h': 'auto',
  '--bksk-cl': colors.line,
  '--bksk-cf': colors.flat,
  '--bksk-ct': colors.text,
})

/**
 * Computes styles needed to render a Stack component.
 * Pure function — framework-agnostic.
 */
export function createStackDescriptor(
  params: StackDescriptorParams
): StackDescriptor {
  const {
    colors,
    direction,
    justify,
    align,
    width,
    height,
    gap,
    rowGap,
    columnGap,
    isVisible,
  } = params

  const defaultStyles = STACK_DEFAULTS(colors)
  const dimensionVars = ['--bksk-w', '--bksk-h']
  const flexDirection = DIRECTION_AXIS[direction] || direction

  const containerStyle: Record<string, string> = {
    flexDirection,
    justifyContent: justify,
    alignItems: align,
    ...createStyleOverride({
      key: '--bksk-w',
      value: formatValue(width || 'auto'),
      defaultStyles,
      skipDimensions: { auto: dimensionVars },
    }),
    ...createStyleOverride({
      key: '--bksk-h',
      value: formatValue(height || 'auto'),
      defaultStyles,
      skipDimensions: { auto: dimensionVars },
    }),
    ...createStyleOverride({
      key: '--bksk-cl',
      value: colors.line,
      defaultStyles,
    }),
    ...createStyleOverride({
      key: '--bksk-cf',
      value: colors.flat,
      defaultStyles,
    }),
    ...createStyleOverride({
      key: '--bksk-ct',
      value: colors.text,
      defaultStyles,
    }),
    ...(gap !== undefined
      ? { rowGap: `${gap}`, columnGap: `${gap}` }
      : {
          ...(rowGap !== undefined ? { rowGap: `${rowGap}` } : {}),
          ...(columnGap !== undefined ? { columnGap: `${columnGap}` } : {}),
        }),
  }

  const classTokens = ['stk']
  if (isVisible) classTokens.push('v')

  return { containerStyle, classTokens }
}

export { DIRECTION_AXIS }
