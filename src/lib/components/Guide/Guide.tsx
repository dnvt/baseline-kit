import { CSSProperties, memo, useMemo, useRef } from 'react'
import {
  useConfig,
  useGuideCalculations,
  useGuideDimensions,
  useDebugging,
  useNormalizedDimensions,
} from '@hooks'
import { cx, cs, normalizeSpacing } from '@utils'
import { AutoConfig, FixedConfig, LineConfig, PatternConfig } from './types'
import type { ComponentsProps } from '../types'
import styles from './styles.module.css'

/** Merged config types allowing variants for line, fixed columns, pattern, or auto column width. */
export type GuideConfig = PatternConfig | AutoConfig | FixedConfig | LineConfig;

export type GuideProps = {
  /**
   * Horizontal alignment of the column set within the container.
   * @default "start"
   */
  align?: 'start' | 'center' | 'end';
} & ComponentsProps & GuideConfig;

/**
 * Guide - A developer/debug overlay for visualizing vertical columns or line-based patterns.
 *
 * @remarks
 * - **Usage**: Useful for checking alignment of layouts, especially if you have a grid-based design.
 * - **Variants**:
 *   - "line": Renders evenly spaced vertical lines (based on `gap` and `base`).
 *   - "auto": Dynamically calculates columns of a given `columnWidth`.
 *   - "pattern": Uses an array of column widths to build a repeating pattern.
 *   - "fixed": Renders a fixed number of columns (via `columns` and optional `columnWidth`).
 * - **Debugging**: If `debugging` is "visible", the columns or lines are rendered in the overlay.
 *   Otherwise, the overlay is hidden (`debugging="none"` or `"hidden"`).
 * - **Spacing**: Also accepts block/inline or padding props to offset the guide from edges or wrap within
 *   a larger container.
 *
 * @example
 * ```tsx
 * <Guide
 *   variant="pattern"
 *   columns={[100, 200, 100]}
 *   gap={2}
 *   debugging="visible"
 *   align="center"
 *   width="1200px"
 * />
 * ```
 */
export const Guide = memo(function Guide({
  className,
  debugging,
  style,
  variant: variantProp,
  align = 'start',
  gap,
  height,
  width,
  columns,
  columnWidth,
  ...props
}: GuideProps) {
  const config = useConfig('guide')
  const variant = variantProp ?? config.variant

  // Determine if debug overlay should be shown
  const { isShown } = useDebugging(debugging, config.debugging)

  // Reference to measure container dimensions
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { width: containerWidth, height: containerHeight } = useGuideDimensions(containerRef)

  // Compute block/inline or padding offsets
  const spacing = useMemo(() => normalizeSpacing(props, config.base), [props, config.base])

  // Normalize the guide's container width/height if provided
  const { normalizedWidth } = useNormalizedDimensions({
    width,
    height,
    defaultWidth: containerWidth,
    defaultHeight: containerHeight,
    base: config.base,
  })

  // Build the grid config object based on provided variant and column settings
  const gridConfig = useMemo(() => {
    const gapInPixels = (gap ?? 1) * config.base

    // Create objects for each variant, picking the relevant one or falling back to "line"
    return (
      {
        line: {
          variant: 'line' as const,
          gap: gapInPixels - 1,
          base: config.base,
        },
        auto: columnWidth
          ? {
            variant: 'auto' as const,
            columnWidth,
            gap: gapInPixels,
            base: config.base,
          }
          : null,
        pattern: Array.isArray(columns)
          ? {
            variant: 'pattern' as const,
            columns,
            gap: gapInPixels,
            base: config.base,
          }
          : null,
        fixed:
          typeof columns === 'number'
            ? {
              variant: 'fixed' as const,
              columns,
              columnWidth,
              gap: gapInPixels,
              base: config.base,
            }
            : null,
      }[variant] ?? {
        variant: 'line' as const,
        gap: gapInPixels - 1,
        base: config.base,
      }
    )
  }, [variant, columns, columnWidth, gap, config.base])

  // Calculate CSS grid settings (# of columns, template strings, etc.) based on container size
  const {
    gridTemplateColumns,
    columnsCount,
    calculatedGap,
  } = useGuideCalculations({
    containerWidth: normalizedWidth,
    config: gridConfig,
  })

  // Build inline styles with CSS vars for color, spacing, alignment, etc.
  const containerStyles = useMemo(() => {
    const baseStyles = {
      '--pdd-guide-gap': `${calculatedGap}px`,
      '--pdd-guide-justify': align,
      '--pdd-guide-color-line': config.colors.line,
      '--pdd-guide-color-pattern': config.colors.pattern,
      '--pdd-guide-padding-block': `${spacing.block[0]}px ${spacing.block[1]}px`,
      '--pdd-guide-padding-inline': `${spacing.inline[0]}px ${spacing.inline[1]}px`,
      '--pdd-guide-template': gridTemplateColumns,
      '--pdd-guide-width': '100vw',
      '--pdd-guide-height': '100vh',
    } as CSSProperties
    return cs(baseStyles, style)
  }, [
    calculatedGap,
    align,
    config.colors.line,
    config.colors.pattern,
    spacing.block,
    spacing.inline,
    gridTemplateColumns,
    style,
  ])

  return (
    <div
      ref={containerRef}
      className={cx(
        styles.guide,
        className,
        isShown ? styles.visible : styles.hidden,
      )}
      data-testid="guide"
      data-variant={variant}
      style={containerStyles}
      {...props}
    >
      {isShown && (
        <div className={styles.columns} data-variant={variant}>
          {Array.from({ length: columnsCount }, (_, i) => {
            const colColor =
              config.colors[variant as keyof typeof config.colors] ?? config.colors.line
            return (
              <div
                key={i}
                className={styles.column}
                data-column-index={i}
                data-variant={variant}
                style={{ backgroundColor: colColor }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
})