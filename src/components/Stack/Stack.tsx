import * as React from 'react'
import type { Gaps, IndicatorNode } from '@components'
import { useConfig, useDebug, useBaseline } from '@hooks'
import { mergeClasses, mergeStyles, parsePadding, formatValue } from '@utils'
import { createDefaultStackStyles, getStackStyleOverride } from './utils/style'
import { createStackGapStyles } from './utils/gap'
import { DIRECTION_AXIS, type CSSPropertiesDirectionalAxis } from './utils/direction'
import { Padder } from '../Padder'
import { Config } from '../Config'
import { ComponentsProps, Variant } from '../types'
import styles from './styles.module.css'

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
} & ComponentsProps &
  Gaps

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
  const config = useConfig('stack')
  const { isShown, debugging } = useDebug(debuggingProp, config.debugging)
  const stackRef = React.useRef<HTMLDivElement | null>(null)

  const initialPadding = React.useMemo(
    () => parsePadding(spacingProps),
    [spacingProps],
  )

  const { padding } = useBaseline(stackRef, {
    base: config.base,
    snapping: 'height',
    spacing: initialPadding,
    warnOnMisalignment: true,
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

    const customOverrides = {
      ...getStackStyleOverride('--bkkw', widthValue, defaultStackStyles),
      ...getStackStyleOverride('--bkkh', heightValue, defaultStackStyles),
      ...getStackStyleOverride('--bkkcl', config.colors.line, defaultStackStyles),
      ...getStackStyleOverride('--bkkcf', config.colors.flat, defaultStackStyles),
      ...getStackStyleOverride('--bkkci', config.colors.text, defaultStackStyles),
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
