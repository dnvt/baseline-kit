/**
 * @file Guide Component
 * @description Visual grid overlay component for alignment and debugging
 * @module components
 */

import * as React from 'react'
import {
  useConfig,
  useDebug,
  useGuide,
  useMeasure,
} from '@hooks'
import { formatValue, mergeClasses, mergeStyles, normalizeValue, parsePadding } from '@utils'
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
export const Guide = React.memo(function Guide({
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
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const { width: containerWidth, height: containerHeight } = useMeasure(containerRef)
  const { top, right, bottom, left } = React.useMemo(() => parsePadding(props), [props])

  const gridConfig = React.useMemo(() => {
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

  const defaultGuideStyles: Record<string, string> = React.useMemo(() => ({
    '--bkgg': `${calculatedGap}px`,
    '--bkgj': 'start',
    '--bkgcl': config.colors.line,
    '--bkgcp': config.colors.pattern,
    '--bkgw': '100vw',
    '--bkgh': '100vh',
  }), [calculatedGap, config.colors.line, config.colors.pattern])

  const getGuideStyleOverride = React.useCallback(
    (key: string, value: string): Record<string, string> => {
      if (
        ((key === '--bkgw') && value === '100vw') ||
        ((key === '--bkgh') && value === '100vh')
      ) {
        return {}
      }
      return value !== defaultGuideStyles[key] ? { [key]: value } : {}
    },
    [defaultGuideStyles],
  )

  // Build base styles (all as string values)
  const baseStyles: Record<string, string> = {
    '--bkgg': `${calculatedGap}px`,
    '--bkgj': align,
    '--bkgcl': config.colors.line,
    '--bkgcp': config.colors.pattern,
    '--bkgpb': `${top}px ${bottom}px`,
    '--bkgpi': `${left}px ${right}px`,
    '--bkgt': template,
    '--bkgw': formatValue(width ?? containerWidth, 0) || '100vw',
    '--bkgh': formatValue(height ?? containerHeight, 0) || '100vh',
  }

  const customOverrides: Record<string, string> = {
    ...getGuideStyleOverride('--bkgw', baseStyles['--bkgw']),
    ...getGuideStyleOverride('--bkgh', baseStyles['--bkgh']),
    ...getGuideStyleOverride('--bkgj', align),
    ...getGuideStyleOverride('--bkgcl', config.colors.line),
    ...getGuideStyleOverride('--bkgcp', config.colors.pattern),
    ...getGuideStyleOverride('--bkgg', `${calculatedGap}px`),
  }

  const containerStyles: Record<string, string> = mergeStyles(baseStyles, customOverrides, style as Record<string, string>)

  return (
    <div
      ref={containerRef}
      data-testid="guide"
      className={mergeClasses(
        styles.gde,
        className,
        isShown ? styles.v : styles.h,
        variant === 'line' && styles.line,
      )}
      data-variant={variant}
      style={containerStyles}
      {...props}
    >
      {isShown && (
        <div className={styles.cols} data-variant={variant}>
          {Array.from({ length: columnsCount }, (_, i) => {
            const colColor =
              config.colors[variant as keyof typeof config.colors] ?? config.colors.line
            return (
              <div
                key={i}
                className={styles.col}
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
