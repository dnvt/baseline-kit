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
  CSSValue,
  normalizeSpacing,
  BlockInlineSpacing,
  PaddingSpacing,
} from '@utils'
import { AutoConfig, FixedConfig, LineConfig, PatternConfig } from './types'
import type { ComponentsProps } from '../types'
import styles from './styles.module.css'

export type GuideConfig = PatternConfig | AutoConfig | FixedConfig | LineConfig
export type GuideProps = {
  align?: 'start' | 'center' | 'end'
  maxWidth?: CSSValue
  height?: CSSValue
} & Omit<ComponentsProps, 'children'> & GuideConfig & (BlockInlineSpacing | PaddingSpacing)

/**
 * Guide (Vertical Columns)
 * In this example, it’s an overlay that tries to fill the full viewport,
 * but you can tweak if you want it inside a normal block flow.
 */
export const Guide = memo(function Guide({
  className,
  visibility,
  style,
  variant: variantProp,
  align = 'start',
  gap,
  height,
  maxWidth,
  columns,
  columnWidth,
  ...props
}: GuideProps) {
  const config = useConfig('guide')
  const variant = variantProp ?? config.variant
  const { isShown } = useVisibility(visibility, config.visibility)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const { width: containerWidth, height: containerHeight } = useGuideDimensions(containerRef)

  const spacing = useMemo(() => normalizeSpacing(props, config.base), [props, config.base])

  const {
    normalizedWidth,
  } = useNormalizedDimensions({
    width: maxWidth,
    height,
    defaultWidth: containerWidth,
    defaultHeight: containerHeight,
    base: config.base,
  })

  // In Guide.tsx, update the gridConfig calculation:

  const gridConfig = useMemo(() => {
    const gapInPixels = (gap ?? 1) * config.base
    return {
      line: {
        variant: 'line' as const,
        gap: gapInPixels,
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
      gap: gapInPixels,
      base: config.base,
    }
  }, [variant, columns, columnWidth, gap, config.base])

  const {
    gridTemplateColumns,
    columnsCount,
    calculatedGap,
  } = useGuideCalculations({
    containerWidth: normalizedWidth,
    config: gridConfig,
  })

  // Build final inline style
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
  }, [calculatedGap, align, config.colors.line, config.colors.pattern, spacing.block, spacing.inline, gridTemplateColumns, style])

  return (
    <div
      ref={containerRef}
      className={cx(
        styles.guide,
        className,
        isShown ? styles.visible : styles.hidden,
      )}
      data-testid={props['data-testid'] ?? 'guide'}
      data-variant={variant}
      style={containerStyles}
      {...props}
    >
      {isShown && (
        <div className={styles.columns} data-variant={variant}>
          {Array.from({ length: columnsCount }, (_, i) => {
            const colColor =
              config.colors[variant as keyof typeof config.colors] ??
              config.colors.line
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