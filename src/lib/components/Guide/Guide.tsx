/**
 * @file Guide Component
 * @description Visual grid overlay component for alignment and debugging
 * @module components
 */

import { CSSProperties, memo, useMemo, useRef } from 'react'
import {
  useConfig,
  useDebug,
  useGuide,
  useMeasure,
} from '@hooks'
import { mergeClasses, mergeStyles, normalizeValue, parsePadding } from '@utils'
import { AutoConfig, FixedConfig, LineConfig, PatternConfig } from './types'
import type { ComponentsProps } from '../types'
import styles from './styles.module.css'

/** Merged configuration types that support various grid layout strategies */
export type GuideConfig = PatternConfig | AutoConfig | FixedConfig | LineConfig;

export type GuideProps = {
  /**
   * Controls horizontal alignment of columns within the container.
   * @default "start"
   */
  align?: 'start' | 'center' | 'end';
} & ComponentsProps & GuideConfig;

/**
 * A developer tool component that provides visual grid overlays for alignment.
 *
 * @remarks
 * Guide renders a configurable grid overlay that helps visualize:
 * - Column layouts and spacing
 * - Content alignment
 * - Layout patterns
 *
 * The component supports multiple variants:
 * - "line": Simple evenly-spaced vertical lines
 * - "pattern": Custom repeating column width patterns
 * - "fixed": Fixed number of equal or custom-width columns
 * - "auto": Dynamically calculated columns based on container width
 *
 * @example
 * ```tsx
 * // Basic column guide
 * <Guide
 *   variant="line"
 *   gap={8}
 *   debugging="visible"
 * />
 *
 * // Custom column pattern
 * <Guide
 *   variant="pattern"
 *   columns={['100px', '1fr', '2fr']}
 *   gap={16}
 *   align="center"
 *   debugging="visible"
 * />
 *
 * // Fixed columns with custom width
 * <Guide
 *   variant="fixed"
 *   columns={12}
 *   columnWidth="60px"
 *   gap={8}
 *   debugging="visible"
 * />
 * ```
 */
export const Guide = memo(function Guide({
  className,
  debugging,
  style,
  variant: variantProp,
  align = 'start',
  gap: gapProp,
  height,
  width,
  columns,
  columnWidth,
  ...props
}: GuideProps) {
  const config = useConfig('guide')
  const variant = variantProp ?? config.variant
  const { isShown } = useDebug(debugging, config.debugging)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { width: containerWidth, height: containerHeight } = useMeasure(containerRef)
  const { top, right, bottom, left } = useMemo(() => parsePadding(props), [props])

  const gridConfig = useMemo(() => {
    const gap = normalizeValue(gapProp)
    return (
      {
        line: {
          variant: 'line' as const,
          gap: gap - 1,
          base: config.base,
        },
        auto: columnWidth
          ? {
            variant: 'auto' as const,
            columnWidth,
            gap,
            base: config.base,
          }
          : null,
        pattern: Array.isArray(columns)
          ? {
            variant: 'pattern' as const,
            columns,
            gap,
            base: config.base,
          }
          : null,
        fixed:
          typeof columns === 'number'
            ? {
              variant: 'fixed' as const,
              columns,
              columnWidth,
              gap,
              base: config.base,
            }
            : null,
      }[variant] ?? {
        variant: 'line' as const,
        gap: gap - 1,
        base: config.base,
      }
    )
  }, [gapProp, config.base, columnWidth, columns, variant])

  const {
    template,
    columnsCount,
    calculatedGap,
  } = useGuide(containerRef, gridConfig)

  const containerStyles = useMemo(() => {
    const baseStyles = {
      '--bk-guide-gap': `${calculatedGap}px`,
      '--bk-guide-justify': align,
      '--bk-guide-color-line': config.colors.line,
      '--bk-guide-color-pattern': config.colors.pattern,
      '--bk-guide-padding-block': `${top}px ${bottom}px`,
      '--bk-guide-padding-inline': `${left}px ${right}px`,
      '--bk-guide-template': template,
      '--bk-guide-width': (width ?? containerWidth) || '100vw',
      '--bk-guide-height': (height ?? containerHeight) || '100vh',
    } as CSSProperties

    return mergeStyles(baseStyles, style)
  }, [
    calculatedGap,
    align,
    config.colors.line,
    config.colors.pattern,
    top,
    bottom,
    left,
    right,
    template,
    width,
    containerWidth,
    height,
    containerHeight,
    style,
  ])

  return (
    <div
      ref={containerRef}
      className={mergeClasses(
        styles.guide,
        className,
        isShown ? styles.visible : styles.hidden,
        variant === 'line' && styles.line,
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