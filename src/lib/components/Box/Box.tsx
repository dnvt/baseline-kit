/**
 * @file Box Component
 * @description A fundamental layout container with baseline grid alignment
 * @module components
 */

import * as React from 'react'
import { useConfig, useDebug, useBaseline } from '@hooks'
import { mergeClasses, mergeStyles, parsePadding, mergeRefs, formatValue } from '@utils'
import { Config } from '../Config'
import { Padder } from '../Padder'
import { ComponentsProps } from '../types'
import styles from './styles.module.css'

/**
 * Determines how the Box component aligns to the baseline grid.
 *
 * @remarks
 * - `none`: No snapping; uses raw spacing values as provided
 * - `height`: Only container height snaps to base unit multiples
 * - `clamp`: Both height and spacing values snap to base unit multiples
 */
export type SnappingMode = 'none' | 'height' | 'clamp';

type BoxProps = {
  /** Number of columns to span in a grid layout */
  colSpan?: number;
  /** Number of rows to span in a grid layout */
  rowSpan?: number;
  /** Shorthand for equal column and row span. Takes precedence over individual spans */
  span?: number;
  /** Controls baseline grid alignment behavior */
  snapping?: SnappingMode;
  children?: React.ReactNode
} & ComponentsProps

/**
 * A foundational container component that ensures consistent spacing and baseline alignment.
 *
 * @remarks
 * Box provides a layout container that:
 * - Ensures consistent spacing aligned to the baseline grid
 * - Supports grid layout integration through span props
 * - Offers configurable snapping modes for fine-grained alignment control
 * - Includes debug overlays for visual alignment verification
 *
 * By default, Box uses "fit-content" for both width and height unless explicitly specified.
 *
 * @example
 * ```tsx
 * // Basic usage with spacing
 * <Box block={16} inline={8}>
 *   <p>Content aligned to baseline</p>
 * </Box>
 *
 * // With grid spanning and custom snapping
 * <Box
 *   colSpan={2}
 *   rowSpan={1}
 *   snapping="height"
 *   debugging="visible"
 * >
 *   <p>Grid-integrated content</p>
 * </Box>
 * ```
 */
export const Box = React.memo(
  React.forwardRef<HTMLDivElement, BoxProps>(function Box(
    {
      children,
      snapping = 'clamp',
      debugging: debuggingProp,
      className,
      colSpan,
      rowSpan,
      span,
      width,
      height,
      style,
      ...spacingProps
    },
    ref,
  ) {
    const config = useConfig('box')
    const { isShown, debugging } = useDebug(debuggingProp, config.debugging)

    const internalRef = React.useRef<HTMLDivElement | null>(null)
    const { top, bottom, left, right } = parsePadding(spacingProps)
    const { padding } = useBaseline(internalRef, {
      base: config.base,
      snapping,
      spacing: { top, bottom, left, right },
      warnOnMisalignment: debugging !== 'none',
    })

    const gridSpanStyles = React.useMemo(() => {
      const gridStyles: React.CSSProperties = {}
      if (span !== undefined) {
        gridStyles.gridColumn = `span ${span}`
        gridStyles.gridRow = `span ${span}`
      } else {
        if (colSpan !== undefined) {
          gridStyles.gridColumn = `span ${colSpan}`
        }
        if (rowSpan !== undefined) {
          gridStyles.gridRow = `span ${rowSpan}`
        }
      }
      return gridStyles
    }, [colSpan, rowSpan, span])

    const defaultBoxStyles: Record<string, string> = React.useMemo(() => ({
      '--bk-box-width': 'var(--bk-width-default)',
      '--bk-box-height': 'var(--bk-height-default)',
      '--bk-box-base': `${config.base}px`,
      '--bk-box-color-line': config.colors.line,
    }), [config.base, config.colors.line])

    // Helper: for width/height, skip if "fit-content"
    const getBoxStyleOverride = React.useCallback(
      (key: string, value: string): Record<string, string | number> => {
        if ((key === '--bk-box-width' || key === '--bk-box-height') && value === 'fit-content') {
          return {}
        }
        return value !== defaultBoxStyles[key] ? { [key]: value } : {}
      },
      [defaultBoxStyles],
    )

    const boxStyles = React.useMemo(() => {
      // Using our formatDimension helper for width and height.
      const widthValue = formatValue(width || 'fit-content')
      const heightValue = formatValue(height || 'fit-content')

      const customStyles = {
        ...getBoxStyleOverride('--bk-box-width', widthValue),
        ...getBoxStyleOverride('--bk-box-height', heightValue),
        ...getBoxStyleOverride('--bk-box-base', `${config.base}px`),
        ...getBoxStyleOverride('--bk-box-color-line', config.colors.line),
      } as React.CSSProperties

      return mergeStyles(customStyles, style)
    }, [config.base, config.colors.line, width, height, getBoxStyleOverride, style])

    return (
      <div
        ref={mergeRefs(ref, internalRef)}
        data-testid="box"
        className={mergeClasses(styles.box, isShown && styles.visible, className)}
        style={mergeStyles(boxStyles, gridSpanStyles)}
      >
        <Config
          base={1}
          spacer={{
            variant: 'flat',
            colors: {
              flat: 'var(--bk-box-color-flat-theme)',
              line: 'var(--bk-box-color-line-theme)',
              indice: 'var(--bk-box-color-indice-theme)',
            },
          }}
        >
          <Padder
            block={[padding.top, padding.bottom]}
            inline={[padding.left, padding.right]}
            width={width}
            height={height}
            debugging={debugging}
          >
            {children}
          </Padder>
        </Config>
      </div>
    )
  }),
)