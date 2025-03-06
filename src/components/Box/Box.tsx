import * as React from 'react'
import { useConfig, useDebug, useBaseline } from '@hooks'
import {
  mergeClasses,
  mergeStyles,
  parsePadding,
  mergeRefs,
  formatValue,
  createGridSpanStyles,
  createStyleOverride,
} from '@utils'
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
export type SnappingMode = 'none' | 'height' | 'clamp'

type BoxProps = {
  /** Number of columns to span in a grid layout */
  colSpan?: number
  /** Number of rows to span in a grid layout */
  rowSpan?: number
  /** Shorthand for equal column and row span. Takes precedence over individual spans */
  span?: number
  /** Controls baseline grid alignment behavior */
  snapping?: SnappingMode
  children?: React.ReactNode
} & ComponentsProps

// Utils -----------------------------------------------------------------------

/**
 * Creates default box styles with theme values.
 * Sets CSS variables for width, height, base unit, and colors.
 */
export const createDefaultBoxStyles = (
  base: number,
  lineColor: string
): Record<string, string> => ({
  '--bkxw': 'fit-content',
  '--bkxh': 'fit-content',
  '--bkxb': `${base}px`,
  '--bkxcl': lineColor,
})

/** Parameters for creating box custom styles */
type BoxCustomStylesParams = {
  /** Width property for the box */
  width?: React.CSSProperties['width'];
  /** Height property for the box */
  height?: React.CSSProperties['height'];
  /** Base unit for measurements */
  base: number;
  /** Line color from theme */
  lineColor: string;
  /** Default styles for comparison */
  defaultStyles: Record<string, string>;
}

/**
 * Creates custom styles for the box.
 * Combines all style properties and only applies changes when needed.
 */
export const createBoxCustomStyles = ({
  width,
  height,
  base,
  lineColor,
  defaultStyles
}: BoxCustomStylesParams): React.CSSProperties => {
  const widthValue = formatValue(width || 'fit-content')
  const heightValue = formatValue(height || 'fit-content')

  // Define box dimensions that should be skipped when set to fit-content
  const dimensionVars = ['--bkxw', '--bkxh']

  return {
    ...createStyleOverride({
      key: '--bkxw',
      value: widthValue,
      defaultStyles,
      skipDimensions: { fitContent: dimensionVars }
    }),
    ...createStyleOverride({
      key: '--bkxh',
      value: heightValue,
      defaultStyles,
      skipDimensions: { fitContent: dimensionVars }
    }),
    ...createStyleOverride({
      key: '--bkxb',
      value: `${base}px`,
      defaultStyles
    }),
    ...createStyleOverride({
      key: '--bkxcl',
      value: lineColor,
      defaultStyles
    }),
  } as React.CSSProperties
}

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
 * By default, Box uses "auto" for both width and height unless explicitly specified.
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

    const gridSpanStyles = React.useMemo(
      () => createGridSpanStyles(span, colSpan, rowSpan),
      [colSpan, rowSpan, span]
    )

    const defaultBoxStyles = React.useMemo(
      () => createDefaultBoxStyles(config.base, config.colors.line),
      [config.base, config.colors.line]
    )

    const boxStyles = React.useMemo(
      () => {
        const customStyles = createBoxCustomStyles({
          width,
          height,
          base: config.base,
          lineColor: config.colors.line,
          defaultStyles: defaultBoxStyles
        })
        return mergeStyles(customStyles, style)
      },
      [config.base, config.colors.line, width, height, defaultBoxStyles, style]
    )

    return (
      <div
        ref={mergeRefs(ref, internalRef)}
        data-testid="box"
        className={mergeClasses(styles.box, isShown && styles.v, className)}
        style={mergeStyles(boxStyles, gridSpanStyles)}
      >
        <Config
          base={1}
          spacer={{ variant: 'flat' }}
        >
          <Padder
            block={[padding.top, padding.bottom]}
            inline={[padding.left, padding.right]}
            width="fit-content"
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
