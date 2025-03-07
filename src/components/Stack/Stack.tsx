import * as React from 'react'
import type { Gaps } from '@components'
import { useConfig, useDebug, useBaseline } from '@hooks'
import {
  mergeClasses,
  mergeStyles,
  parsePadding,
  formatValue,
  createStyleOverride,
} from '@utils'
import { Padder } from '../Padder'
import { IndicatorNode } from '../Spacer'
import { Config } from '../Config'
import { ComponentsProps, Variant } from '../types'
import styles from './styles.module.css'

// Maps shorthand directions to Flexbox directions
export const DIRECTION_AXIS: Record<string, React.CSSProperties['flexDirection']> = {
  x: 'row',
  y: 'column',
  '-x': 'row-reverse',
  '-y': 'column-reverse',
}

export type CSSPropertiesDirectionalAxis = keyof typeof DIRECTION_AXIS;

export type StackProps = {
  /** Main axis orientation */
  direction?: React.CSSProperties['flexDirection'] & CSSPropertiesDirectionalAxis;
  /** Distribution of space on main axis */
  justify?: React.CSSProperties['justifyContent']
  /** Alignment on cross axis */
  align?: React.CSSProperties['alignItems']
  /** Container width (defaults to "auto") */
  width?: React.CSSProperties['width']
  /** Container height (defaults to "auto") */
  height?: React.CSSProperties['height']
  /** Custom measurement indicator renderer */
  indicatorNode?: IndicatorNode
  /** Visual style in debug mode */
  variant?: Variant
  children?: React.ReactNode
} & ComponentsProps & Gaps

// Utils -----------------------------------------------------------------------

/** Creates default stack styles with theme colors */
export const createDefaultStackStyles = (colors: Record<string, string>) => ({
  '--bkkw': 'auto',
  '--bkkh': 'auto',
  '--bkkcl': colors.line,
  '--bkkcf': colors.flat,
  '--bkkci': colors.text,
})

/** Creates gap styles for the stack */
export const createStackGapStyles = (
  rowGap?: number,
  columnGap?: number,
  gap?: number,
): Record<string, number | undefined> => ({
  rowGap: gap !== undefined ? gap : rowGap,
  columnGap: gap !== undefined ? gap : columnGap,
})

/**
 * A flexible container component aligning children to the baseline grid.
 *
 * @remarks
 * Stack provides a flex container that:
 * - Maintains baseline grid alignment
 * - Supports both row and column layouts
 * - Handles consistent spacing between items
 * - Includes visual debug overlays
 *
 * Key features:
 * - Automatic dimension management (defaults to auto)
 * - Direct padding application in non-debug mode
 * - Comprehensive alignment controls
 * - Theme-aware debug visuals
 *
 * @example
 * ```tsx
 * // Basic horizontal stack
 * <Stack gap={16}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 *
 * // Vertical stack with alignment
 * <Stack
 *   direction="column"
 *   gap={24}
 *   align="center"
 *   justify="space-between"
 *   debugging="visible"
 * >
 *   <div>Top</div>
 *   <div>Middle</div>
 *   <div>Bottom</div>
 * </Stack>
 *
 * // Complex layout with padding
 * <Stack
 *   direction="row"
 *   gap={32}
 *   align="stretch"
 *   block={[16, 24]}
 *   inline={16}
 *   debugging="visible"
 * >
 *   <div>Panel 1</div>
 *   <div>Panel 2</div>
 * </Stack>
 * ```
 */
export const Stack = React.memo(function Stack({
  align = 'flex-start',
  children,
  className,
  columnGap,
  debugging: debuggingProp,
  direction = 'row',
  gap,
  height,
  indicatorNode,
  justify = 'flex-start',
  rowGap,
  style,
  variant,
  width,
  ...spacingProps
}: StackProps) {
  // Read configuration from context or props
  const config = useConfig('stack')
  const { isShown, debugging } = useDebug(debuggingProp, config.debugging)
  const stackRef = React.useRef<HTMLDivElement | null>(null)

  // Process spacing props
  const { top, right, bottom, left } = parsePadding({
    ...spacingProps,
  })

  const { padding } = useBaseline(stackRef, {
    base: config.base,
    snapping: 'height',
    spacing: { top, right, bottom, left },
    warnOnMisalignment: debugging !== 'none',
  })

  const stackGapStyles = React.useMemo(() => {
    const formattedRowGap = rowGap !== undefined ? Number(rowGap) : undefined
    const formattedColumnGap = columnGap !== undefined ? Number(columnGap) : undefined
    const formattedGap = gap !== undefined ? Number(gap) : undefined

    return createStackGapStyles(formattedRowGap, formattedColumnGap, formattedGap)
  }, [rowGap, columnGap, gap])

  const defaultStackStyles = React.useMemo(
    () => createDefaultStackStyles(config.colors),
    [config.colors],
  )

  const containerStyles = React.useMemo(() => {
    const widthValue = formatValue(width || 'auto')
    const heightValue = formatValue(height || 'auto')
    const flexDirection = DIRECTION_AXIS[direction] || direction

    // Define stack dimensions that should be skipped when set to auto
    const dimensionVars = ['--bkkw', '--bkkh']

    const customOverrides = {
      ...createStyleOverride({
        key: '--bkkw',
        value: widthValue,
        defaultStyles: defaultStackStyles,
        skipDimensions: { auto: dimensionVars },
      }),
      ...createStyleOverride({
        key: '--bkkh',
        value: heightValue,
        defaultStyles: defaultStackStyles,
        skipDimensions: { auto: dimensionVars },
      }),
      ...createStyleOverride({
        key: '--bkkcl',
        value: config.colors.line,
        defaultStyles: defaultStackStyles,
      }),
      ...createStyleOverride({
        key: '--bkkcf',
        value: config.colors.flat,
        defaultStyles: defaultStackStyles,
      }),
      ...createStyleOverride({
        key: '--bkkci',
        value: config.colors.text,
        defaultStyles: defaultStackStyles,
      }),
    } as React.CSSProperties

    const baseStyles = {
      flexDirection,
      justifyContent: justify,
      alignItems: align,
      width,
      height,
    } as React.CSSProperties

    return mergeStyles(baseStyles, stackGapStyles, customOverrides, style)
  }, [
    direction,
    justify,
    align,
    width,
    height,
    config.colors.line,
    config.colors.flat,
    config.colors.text,
    defaultStackStyles,
    stackGapStyles,
    style,
  ])

  const mergedContainerStyles =
    debugging === 'none'
      ? {
        ...containerStyles,
        paddingBlock: `${padding.top}px ${padding.bottom}px`,
        paddingInline: `${padding.left}px ${padding.right}px`,
      }
      : containerStyles

  return (
    <Config
      spacer={{ variant: variant ?? 'line' }}
    >
      <Padder
        ref={stackRef}
        className={isShown ? styles.v : ''}
        block={[padding.top, padding.bottom]}
        inline={[padding.left, padding.right]}
        debugging={debugging}
        indicatorNode={indicatorNode}
        width={width}
        height={height}
      >
        <div
          data-testid="stack"
          className={mergeClasses(className, styles.stk)}
          style={mergedContainerStyles}
          {...spacingProps}
        >
          {children}
        </div>
      </Padder>
    </Config>
  )
})
