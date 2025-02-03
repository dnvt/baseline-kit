import {
  CSSProperties,
  memo,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useConfig, useDebug, useBaseline, useMeasure } from '@hooks'
import { cs, cx, parsePadding } from '@utils'
import { formatValue } from '@utils'
import { Config } from '../Config'
import { Padder } from '../Padder'
import { ComponentsProps } from '../types'
import styles from './styles.module.css'

export type FlexProps = {
  /** Flex direction: 'row' (default) or 'column'. */
  direction?: 'row' | 'column';
  /** Justify content, e.g. 'flex-start', 'center', 'space-between'. */
  justify?: CSSProperties['justifyContent'];
  /** Align items, e.g. 'flex-start', 'center', 'stretch'. */
  align?: CSSProperties['alignItems'];
  /** Optionally, force a fixed width for the container. */
  width?: CSSProperties['width'];
  /** Optionally, force a fixed height for the container. */
  height?: CSSProperties['height'];
  children?: ReactNode;
} & ComponentsProps;

/**
 * Flex - A flexible box layout container with built-in baseline alignment and padding management.
 * Provides responsive width/height handling and debug warnings for grid misalignment.
 *
 * @remarks
 * - **Flexbox Layout**: Full control over flex direction, justification, and alignment
 * - **Baseline Snapping**: Automatically aligns content height to base unit grid
 * - **Debug Warnings**: Console warnings for height/base unit misalignment
 * - **Responsive Dimensions**: Handles percentage-based and fixed dimensions
 * - **Padding Integration**: Uses Padder internally for consistent spacing visualization
 *
 * @example
 * ```tsx
 * <Flex direction="column" gap={8} debugging="visible">
 *   <Box>Header</Box>
 *   <Box flex={1}>Content</Box>
 *   <Box>Footer</Box>
 * </Flex>
 * ```
 */
export const Flex = memo(function Flex({
  children,
  debugging,
  direction = 'row',
  justify = 'flex-start',
  align = 'stretch',
  className,
  width,
  height,
  style,
  ...spacingProps
}: FlexProps) {
  // Get configuration.
  const config = useConfig('flex')
  const { isShown } = useDebug(debugging, config.debugging)

  // Reference for measuring container.
  const flexRef = useRef<HTMLDivElement | null>(null)
  const { width: measuredWidth, height: measuredHeight } = useMeasure(flexRef)

  // Parse spacing props (e.g. block/inline) into normalized values.
  const { top, right, bottom, left } = useMemo(
    () => parsePadding(spacingProps),
    [spacingProps],
  )

  // Use baseline hook with snapping mode "height".
  const { padding } = useBaseline(flexRef, {
    base: config.base,
    snapping: 'height',
    spacing: { top, right, bottom, left },
    warnOnMisalignment: true,
  })

  // Warn if measured height is not a multiple of the base unit.
  useEffect(() => {
    if (measuredHeight && measuredHeight % config.base !== 0) {
      console.warn(
        `Flex component: measured height (${measuredHeight}px) is not a multiple of base (${config.base}px).`,
      )
    }
  }, [measuredHeight, config.base])

  // Build container styles.
  const containerStyles = useMemo(() => {
    const baseStyles: CSSProperties = {
      display: 'flex',
      flexDirection: direction,
      justifyContent: justify,
      alignItems: align,
      width: formatValue(width, measuredWidth),
      height: formatValue(height, measuredHeight),
      // When debugging is off (i.e. isShown is false), apply the computed padding
      // using the CSS custom properties "padding-block" and "padding-inline".
      ...(isShown
        ? {}
        : {
          paddingBlock: `${padding.top}px ${padding.bottom}px`,
          paddingInline: `${padding.left}px ${padding.right}px`,
        }),
    }
    return cs(baseStyles, style)
  }, [
    direction,
    justify,
    align,
    width,
    height,
    measuredWidth,
    measuredHeight,
    padding,
    isShown,
    style,
  ])

  return (
    <Config base={config.base}>
      <div
        ref={flexRef}
        className={cx(styles.flex, className)}
        data-testid="flex"
        style={containerStyles}
        {...spacingProps}
      >
        <Padder
          block={[padding.top, padding.bottom]}
          inline={[padding.left, padding.right]}
          debugging={config.debugging}
          width={width}
          height={height}
        >
          {children}
        </Padder>
      </div>
    </Config>
  )
})