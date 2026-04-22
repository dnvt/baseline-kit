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

  // --bksk-cl / --bksk-cf / --bksk-ct intentionally omitted: their runtime
  // value equals the default (both derived from the same `colors` input that
  // seeds STACK_DEFAULTS), so inline overrides would never emit. Styling
  // lands at the CSS layer via the module's declared defaults.
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
    ...(gap !== undefined
      ? { rowGap: formatValue(gap), columnGap: formatValue(gap) }
      : {
          ...(rowGap !== undefined ? { rowGap: formatValue(rowGap) } : {}),
          ...(columnGap !== undefined
            ? { columnGap: formatValue(columnGap) }
            : {}),
        }),
  }

  const classTokens = ['stk']
  if (isVisible) classTokens.push('v')

  return { containerStyle, classTokens }
}

export { DIRECTION_AXIS }
