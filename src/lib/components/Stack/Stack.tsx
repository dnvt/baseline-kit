/**
 * @file Stack Component
 * @description Flex container with baseline grid alignment
 * @module components
 */

import * as React from 'react'
import { IndicatorNode } from '@components'
import { useConfig, useDebug, useBaseline } from '@hooks'
import { mergeClasses, mergeStyles, parsePadding } from '@utils'
import { Padder } from '../Padder'
import { Config } from '../Config'
import { ComponentsProps, Variant } from '../types'
import styles from './styles.module.css'

export type StackProps = {
  /** Main axis orientation */
  direction?: 'row' | 'column';
  /** Distribution of space on main axis */
  justify?: React.CSSProperties['justifyContent'];
  /** Space between children */
  gap?: React.CSSProperties['gap'];
  /** Alignment on cross axis */
  align?: React.CSSProperties['alignItems'];
  /** Container width (defaults to "fit-content") */
  width?: React.CSSProperties['width'];
  /** Container height (defaults to "fit-content") */
  height?: React.CSSProperties['height'];
  /** Custom measurement indicator renderer */
  indicatorNode?: IndicatorNode;
  /** Visual style in debug mode */
  variant?: Variant;
  children?: React.ReactNode;
} & ComponentsProps;

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
 * - Automatic dimension management (defaults to fit-content)
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
  align = 'stretch',
  children,
  className,
  debugging: debuggingProp,
  direction = 'row',
  gap,
  height,
  indicatorNode,
  justify = 'flex-start',
  variant,
  style,
  width,
  ...spacingProps
}: StackProps) {
  const config = useConfig('flex')
  const { isShown, debugging } = useDebug(debuggingProp, config.debugging)
  const stackRef = React.useRef<HTMLDivElement | null>(null)

  const initialPadding = React.useMemo(() => parsePadding(spacingProps), [spacingProps])
  const { padding } = useBaseline(stackRef, {
    base: config.base,
    snapping: 'height',
    spacing: initialPadding,
    warnOnMisalignment: true,
  })

  const stackGapStyles = React.useMemo(() => ({
    gap: gap !== undefined ? gap : undefined,
  }), [gap])

  const containerStyles = React.useMemo(() => {
    return mergeStyles({
      display: 'flex',
      flexDirection: direction,
      justifyContent: justify,
      alignItems: align,
      width: width || 'fit-content',
      height: height || 'fit-content',
      '--bk-stack-color-line': config.colors.line,
      '--bk-stack-color-flat': config.colors.flat,
      '--bk-stack-color-indice': config.colors.indice,
    } as React.CSSProperties,
    stackGapStyles,
    style,
    )
  }, [direction, justify, align, width, height, config.colors.line, config.colors.flat, config.colors.indice, stackGapStyles, style])

  const mergedContainerStyles =
    debugging === 'none'
      ? {
        ...containerStyles,
        paddingBlock: `${padding.top}px ${padding.bottom}px`,
        paddingInline: `${padding.left}px ${padding.right}px`,
      }
      : containerStyles

  return (
    <Config spacer={{ variant }}>
      <Padder
        ref={stackRef}
        data-testid="padder"
        block={[padding.top, padding.bottom]}
        inline={[padding.left, padding.right]}
        debugging={debugging}
        indicatorNode={indicatorNode}
        width={width}
        height={height}
      >
        <div
          data-testid="stack"
          className={mergeClasses(
            className,
            styles.stack,
            isShown && styles.visible,
          )}
          style={mergedContainerStyles}
          {...spacingProps}
        >
          {children}
        </div>
      </Padder>
    </Config>
  )
})