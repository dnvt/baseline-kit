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
}

export interface StackDescriptor {
  containerStyle: Record<string, string>
}

const STACK_DEFAULTS = (colors: { line: string; flat: string; text: string }) => ({
  '--bkkw': 'auto',
  '--bkkh': 'auto',
  '--bkkcl': colors.line,
  '--bkkcf': colors.flat,
  '--bkkci': colors.text,
})

/**
 * Computes styles needed to render a Stack component.
 * Pure function — framework-agnostic.
 */
export function createStackDescriptor(params: StackDescriptorParams): StackDescriptor {
  const { colors, direction, justify, align, width, height, gap, rowGap, columnGap } = params

  const defaultStyles = STACK_DEFAULTS(colors)
  const dimensionVars = ['--bkkw', '--bkkh']
  const flexDirection = DIRECTION_AXIS[direction] || direction

  const containerStyle: Record<string, string> = {
    flexDirection,
    justifyContent: justify,
    alignItems: align,
    ...createStyleOverride({ key: '--bkkw', value: formatValue(width || 'auto'), defaultStyles, skipDimensions: { auto: dimensionVars } }),
    ...createStyleOverride({ key: '--bkkh', value: formatValue(height || 'auto'), defaultStyles, skipDimensions: { auto: dimensionVars } }),
    ...createStyleOverride({ key: '--bkkcl', value: colors.line, defaultStyles }),
    ...createStyleOverride({ key: '--bkkcf', value: colors.flat, defaultStyles }),
    ...createStyleOverride({ key: '--bkkci', value: colors.text, defaultStyles }),
    ...(gap !== undefined ? { rowGap: `${gap}`, columnGap: `${gap}` } : {
      ...(rowGap !== undefined ? { rowGap: `${rowGap}` } : {}),
      ...(columnGap !== undefined ? { columnGap: `${columnGap}` } : {}),
    }),
  }

  return { containerStyle }
}

export { DIRECTION_AXIS }
