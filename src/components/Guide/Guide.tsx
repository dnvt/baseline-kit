import * as React from 'react'
import {
  useConfig,
  useDebug,
  useGuide,
  useMeasure,
} from '@hooks'
import {
  formatValue,
  mergeClasses,
  mergeStyles,
  normalizeValue,
  createStyleOverride,
} from '@utils'
import { AutoConfig, FixedConfig, LineConfig, PatternConfig } from './types'
import type { ComponentsProps, GuideVariant } from '../types'
import styles from './styles.module.css'

/** Merged configuration types that support various grid layout strategies */
export type GuideConfig = PatternConfig | AutoConfig | FixedConfig | LineConfig;

export type GuideProps = {
  /** Controls horizontal alignment of columns within the container */
  align?: React.CSSProperties['justifyContent']
  /** Visual style of the guide */
  variant?: GuideVariant
  /** Number of columns (for fixed/auto variants) */
  columns?: number
  /** Column width (for fixed variant) */
  columnWidth?: React.CSSProperties['width']
  /** Gutter width between columns */
  gutterWidth?: React.CSSProperties['width']
  /** Maximum width of the guide */
  maxWidth?: React.CSSProperties['maxWidth']
  /** Color override for guide lines */
  color?: React.CSSProperties['color']
  /** Content to render inside the guide */
  children?: React.ReactNode
  /** Gap between columns */
  gap?: number
} & ComponentsProps & GuideConfig;

/** Parameters for creating a grid configuration */
type GridConfigParams = {
  variant: GuideVariant;
  base: number;
  gap: number;
  columns?: number | readonly (string | number | undefined | 'auto')[];
  columnWidth?: React.CSSProperties['width'];
}

// Utils -----------------------------------------------------------------------

/** Creates the appropriate grid configuration based on variant */
export const createGridConfig = (
  params: GridConfigParams,
): (PatternConfig | AutoConfig | FixedConfig | LineConfig) => {
  const { variant, base, gap, columns, columnWidth } = params

  return {
    line: {
      variant: 'line' as const,
      gap: gap - 1,
      base,
    },
    auto: columnWidth
      ? {
        variant: 'auto' as const,
        columnWidth,
        gap,
        base,
      }
      : null,
    pattern: Array.isArray(columns)
      ? {
        variant: 'pattern' as const,
        columns,
        gap,
        base,
      }
      : null,
    fixed:
      typeof columns === 'number'
        ? {
          variant: 'fixed' as const,
          columns,
          columnWidth,
          gap,
          base,
        }
        : null,
  }[variant] ?? {
    variant: 'line' as const,
    gap: gap - 1,
    base,
  }
}

/** Creates default guide styles */
export const createDefaultGuideStyles = (
  base: number,
  lineColor: string,
): Record<string, string> => ({
  '--bkgw': 'auto',
  '--bkgh': 'auto',
  '--bkgmw': 'none',
  '--bkgcw': '60px',
  '--bkggw': '24px',
  '--bkgc': '12',
  '--bkgb': `${base}px`,
  '--bkgcl': lineColor,
})

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
  gutterWidth,
  maxWidth,
  color,
  children,
  ...props
}: GuideProps) {
  const config = useConfig('guide')
  const variant = variantProp ?? config.variant
  const { isShown } = useDebug(debugging, config.debugging)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const { width: containerWidth, height: containerHeight } = useMeasure(containerRef)

  const gridConfig = React.useMemo(() => {
    const gap = normalizeValue(gapProp)
    return createGridConfig({
      variant,
      base: config.base,
      gap,
      columns,
      columnWidth,
    })
  }, [gapProp, config.base, columnWidth, columns, variant])

  const {
    template,
    columnsCount,
    calculatedGap,
  } = useGuide(containerRef, gridConfig)

  const defaultStyles = React.useMemo(
    () => createDefaultGuideStyles(config.base, config.colors.line),
    [config.base, config.colors.line],
  )

  const containerStyles = React.useMemo(() => {
    // Process dimension values
    const widthValue = formatValue(width || containerWidth || 'auto')
    const heightValue = formatValue(height || containerHeight || 'auto')
    const maxWidthValue = formatValue(maxWidth || 'none')
    const columnWidthValue = formatValue(columnWidth || '60px')
    const gutterWidthValue = formatValue(gutterWidth || '24px')

    // Define dimensions that should be skipped when set to auto
    const autoDimensions = ['--bkgw', '--bkgh']

    // Create custom styles with conditional overrides
    const customStyles = {
      ...createStyleOverride({
        key: '--bkgw',
        value: widthValue,
        defaultStyles,
        skipDimensions: { auto: autoDimensions },
      }),
      ...createStyleOverride({
        key: '--bkgh',
        value: heightValue,
        defaultStyles,
        skipDimensions: { auto: autoDimensions },
      }),
      ...createStyleOverride({
        key: '--bkgmw',
        value: maxWidthValue,
        defaultStyles,
      }),
      ...createStyleOverride({
        key: '--bkgcw',
        value: columnWidthValue,
        defaultStyles,
      }),
      ...createStyleOverride({
        key: '--bkggw',
        value: gutterWidthValue,
        defaultStyles,
      }),
      ...createStyleOverride({
        key: '--bkgc',
        value: `${columnsCount}`,
        defaultStyles,
      }),
      ...createStyleOverride({
        key: '--bkgb',
        value: `${config.base}px`,
        defaultStyles,
      }),
      ...createStyleOverride({
        key: '--bkgcl',
        value: color ?? config.colors.line,
        defaultStyles,
      }),
      // Add the CSS variables expected by tests
      '--bkgg': `${calculatedGap}px`,
      ...(template && template !== 'none' ? { '--bkgt': template } : {}),
      // Add grid template if available
      ...(template && template !== 'none' ? { gridTemplateColumns: template } : {}),
      // Add gap if calculated
      ...(calculatedGap ? { gap: `${calculatedGap}px` } : {}),
      // Add justifyContent based on align
      justifyContent: align,
    } as React.CSSProperties

    return mergeStyles(customStyles, style)
  }, [
    width,
    height,
    maxWidth,
    columnWidth,
    gutterWidth,
    columnsCount,
    color,
    template,
    calculatedGap,
    containerWidth,
    containerHeight,
    config.base,
    config.colors.line,
    defaultStyles,
    style,
    align,
  ])

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
      {children}
    </div>
  )
})
