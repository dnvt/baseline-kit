import { CSSProperties, memo, useMemo, useRef } from 'react'
import {
  useConfig,
  useGuideCalculations,
  useGuideDimensions,
  useVisibility,
  useNormalizedDimensions,
} from '@hooks'
import {
  cx,
  cs,
  Direction,
  CSSValue,
  normalizeSpacing,
  BlockInlineSpacing,
  PaddingSpacing,
  convertToPixels,
} from '@utils'
import { GridColumns, GridRows } from './components'
import { AutoConfig, FixedConfig, LineConfig, PatternConfig } from './types'
import styles from './styles.module.css'
import { ComponentsProps, GridAlignment } from '../types'

export type GuideConfig = PatternConfig | AutoConfig | FixedConfig | LineConfig

export type GuideProps = {
  /** Grid alignment */
  align?: GridAlignment
  /** Guide direction */
  direction?: Direction
  /** Max Width of the guide */
  maxWidth?: CSSValue
  /** Height of the guide */
  height?: CSSValue
} & ComponentsProps & GuideConfig & (BlockInlineSpacing | PaddingSpacing)

/**
 * Guide Component
 * A flexible column or row grid system with support for multiple layout variants.
 */
export const Guide = memo(function Guide({
  className,
  visibility,
  style,
  variant: variantProp,
  align = 'start',
  direction = 'vertical',
  gap,
  height,
  maxWidth,
  columns,
  columnWidth,
  ...props
}: GuideProps) {
  const config = useConfig('guide')
  const containerRef = useRef<HTMLDivElement | null>(null)

  const { width: containerWidth, height: containerHeight } = useGuideDimensions(containerRef)

  const variant = variantProp ?? config.variant
  const { isShown } = useVisibility(visibility, config.visibility)

  const spacing = useMemo(
    () => normalizeSpacing(props, config.base),
    [props, config.base],
  )

  const resolvedHeight = useMemo(() => {
    // If explicit height is provided, use it
    if (height) {
      if (typeof height === 'number') {
        return height
      }
      const px = convertToPixels(height)
      if (px !== null) {
        return px
      }
    }

    // Otherwise use container height
    return containerHeight
  }, [height, containerHeight])

  // Provide these to your standard dimensions hook (which is used for styling).
  // The fallback "height" will be containerHeight if needed.
  const {
    width: cssWidth,
    normalizedWidth,
  } = useNormalizedDimensions({
    width: maxWidth,
    height,
    defaultWidth: containerWidth,
    defaultHeight: containerHeight,
    base: config.base,
  })

  // For horizontal direction, figure out how many lines/rows total
  const rowCount = useMemo(() => {
    if (direction !== 'horizontal') return 0

    const totalHeight = resolvedHeight
    if (!totalHeight) return 1

    // Calculate rows based on total height and base unit
    return Math.max(1, Math.ceil(totalHeight / config.base))
  }, [direction, resolvedHeight, config.base])

  // Create the grid config object for vertical columns (if direction="vertical").
  const gridConfig = useMemo(() => {
    const gapInPixels = (gap ?? 1) * config.base

    const configs = {
      line: {
        variant: 'line' as const,
        gap: Math.max(0, gapInPixels - 1),
        base: config.base,
      } satisfies LineConfig,

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
    }

    return configs[variant] ?? configs.line
  }, [variant, columns, columnWidth, gap, config.base])

  const { gridTemplateColumns, columnsCount, calculatedGap } = useGuideCalculations({
    containerWidth: normalizedWidth,
    config: gridConfig,
  })

  const containerStyles = useMemo(() => {
    const baseStyles = {
      '--pdd-guide-gap': `${calculatedGap}`,
      '--pdd-guide-justify': align,
      '--pdd-guide-color-line': config.colors.line,
      '--pdd-guide-color-pattern': config.colors.pattern,
      '--pdd-guide-padding-block': `${spacing.block[0]}px ${spacing.block[1]}px`,
      '--pdd-guide-padding-inline': `${spacing.inline[0]}px ${spacing.inline[1]}px`,
    } as CSSProperties

    if (direction === 'horizontal') {
      return cs(
        {
          ...baseStyles,
          '--pdd-guide-width': '100%',
          position: 'relative',
        } as CSSProperties,
        style,
      )
    }

    // For vertical columns
    return cs(
      {
        ...baseStyles,
        '--pdd-guide-template': gridTemplateColumns,
        '--pdd-guide-width': cssWidth,
        '--pdd-guide-height': '100%',
      } as CSSProperties,
      style,
    )
  }, [calculatedGap, align, config.colors.line, config.colors.pattern, spacing.block, spacing.inline, direction, gridTemplateColumns, cssWidth, style])

  return (
    <div
      ref={containerRef}
      className={cx(
        styles['guide-container'],
        direction === 'horizontal' && styles['horizontal-guide'],
        className,
        isShown ? styles.visible : styles.hidden,
      )}
      data-variant={variant}
      data-direction={direction}
      style={containerStyles}
      {...props}
    >
      {isShown && direction === 'horizontal' ? (
        <GridRows
          count={rowCount}
          base={config.base}
          color={config.colors[variant]}
          containerRef={containerRef}
          variant={variant}
        />
      ) : (
        isShown && (
          <GridColumns
            count={columnsCount}
            variant={variant}
            colors={config.colors}
          />
        )
      )}
    </div>
  )
})
