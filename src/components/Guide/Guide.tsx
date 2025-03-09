import * as React from 'react'
import { ComponentsProps } from '@components'
import { useConfig, useDebug, useGuide, useMeasure } from '@hooks'
import {
  formatValue,
  mergeClasses,
  mergeStyles,
  createStyleOverride,
  ClientOnly,
} from '@utils'
import { AutoConfig, FixedConfig, LineConfig, PatternConfig } from './types'
import type { GuideVariant } from '../types'
import styles from './styles.module.css'

/** Merged configuration types that support various grid layout strategies */
export type GuideConfig = PatternConfig | AutoConfig | FixedConfig | LineConfig

export type GuideProps = {
  /** Controls horizontal alignment of columns within the container */
  align?: React.CSSProperties['justifyContent']
  /** Visual style of the guide */
  variant?: GuideVariant
  /** Number of columns (for fixed/auto variants) */
  columns?: number | readonly (string | number | undefined | 'auto')[]
  /** Column width (for fixed variant) */
  columnWidth?: React.CSSProperties['width']
  /** Maximum width of the guide */
  maxWidth?: React.CSSProperties['maxWidth']
  /** Color override for guide lines */
  color?: React.CSSProperties['color']
  /** Content to render inside the guide */
  children?: React.ReactNode
  /** Gap between columns */
  gap?: number
  /** Flag to enable SSR-compatible mode (simplified initial render) */
  ssrMode?: boolean
} & ComponentsProps &
  Omit<GuideConfig, 'columns' | 'columnWidth' | 'gap'>

/** Parameters for creating a grid configuration */
type GridConfigParams = {
  variant: GuideVariant
  base: number
  gap: number
  columns?: number | readonly (string | number | undefined | 'auto')[]
  columnWidth?: React.CSSProperties['width']
}

/**
 * Creates a grid configuration based on the specified variant and parameters
 * Internal helper function for Guide component
 */
const createGridConfig = (
  params: GridConfigParams
): PatternConfig | AutoConfig | FixedConfig | LineConfig => {
  const { variant, base, gap, columns, columnWidth } = params

  switch (variant) {
    case 'line':
      return {
        variant: 'line',
        gap,
        base,
      } as LineConfig

    case 'pattern':
      if (columns && Array.isArray(columns)) {
        return {
          variant: 'pattern',
          columns: columns as readonly (string | number)[],
          gap,
          base,
        } as PatternConfig
      }
      break

    case 'fixed':
      if (columns !== undefined) {
        const parsedColumns =
          typeof columns === 'number' ? columns : parseInt(String(columns), 10)
        return {
          variant: 'fixed',
          columns: !isNaN(parsedColumns) ? parsedColumns : 12,
          columnWidth: columnWidth || '60px',
          gap,
          base,
        } as FixedConfig
      }
      break
  }

  // Default to auto columns if no valid configuration was created
  return {
    variant: 'auto',
    columnWidth: columnWidth || '1fr',
    gap,
    base,
  } as AutoConfig
}

/** Creates default guide styles */
const createDefaultGuideStyles = (
  base: number,
  lineColor: string
): Record<string, string> => ({
  '--bkgw': 'auto',
  '--bkgh': 'auto',
  '--bkgmw': 'none',
  '--bkgcw': '60px',
  '--bkggw': '24px',
  '--bkgc': '12',
  '--bkgb': `${base}px`,
  '--bkgcl': lineColor,
  '--bkgg': '0',
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
  align = 'center',
  gap: gapProp,
  height,
  width,
  columns,
  columnWidth,
  maxWidth,
  color,
  children,
  ssrMode = false,
  ...props
}: GuideProps) {
  const config = useConfig('guide')
  const variant = variantProp ?? config.variant
  const gap = typeof gapProp === 'number' ? gapProp : 0
  const { isShown } = useDebug(debugging, config.debugging)

  // If debugging isn't enabled, render a hidden element
  // This ensures tests can find the element even when hidden
  if (!isShown) {
    return (
      <div
        className={mergeClasses(styles.g, styles.h, className)}
        style={style}
        data-testid="guide"
        data-variant={variant}
        {...props}
      >
        {children}
      </div>
    )
  }

  // Create a simple SSR fallback with the expected dimensions
  const ssrFallback = (
    <div
      className={mergeClasses(styles.g, styles.h, styles.ssr, className)}
      style={{
        width: width || '100%',
        height: height || '100%',
        maxWidth: maxWidth || 'none',
        ...style,
      }}
      data-testid="guide"
      data-variant={variant}
    >
      {children}
    </div>
  )

  // Wrap the actual implementation in ClientOnly
  return (
    <ClientOnly fallback={ssrFallback}>
      <GuideImpl
        className={className}
        debugging={debugging}
        style={style}
        variant={variant}
        align={align}
        gap={gap}
        height={height}
        width={width}
        columns={columns}
        columnWidth={columnWidth}
        maxWidth={maxWidth}
        color={color}
        ssrMode={ssrMode}
        {...props}
      >
        {children}
      </GuideImpl>
    </ClientOnly>
  )
})

// Implementation component that only renders on the client side
const GuideImpl = React.memo(function GuideImpl({
  className,
  debugging,
  style,
  variant,
  align = 'center',
  gap,
  height,
  width,
  columns,
  columnWidth,
  maxWidth,
  color,
  children,
  ssrMode: _ssrMode = false,
  ...props
}: GuideProps) {
  const config = useConfig('guide')
  const { isShown } = useDebug(debugging, config.debugging)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  // Measure the container dimensions
  const {
    width: containerWidth,
    height: containerHeight,
    refresh, // Keep the refresh function available for dynamic updates
  } = useMeasure(containerRef)

  // Effect for handling window resize events
  React.useEffect(() => {
    const handleResize = () => {
      // Trigger a remeasurement when window size changes
      refresh()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [refresh])

  // Create guide configuration based on variant
  const gridConfig = React.useMemo(() => {
    // Ensure we have valid values for the grid configuration
    const safeVariant = variant as GuideVariant
    const safeGap = typeof gap === 'number' ? gap : 0

    return createGridConfig({
      variant: safeVariant,
      base: config.base,
      gap: safeGap,
      columns,
      columnWidth,
    })
  }, [variant, config.base, gap, columns, columnWidth])

  const { template, columnsCount, calculatedGap } = useGuide(
    containerRef,
    gridConfig
  )

  const defaultStyles = React.useMemo(
    () => createDefaultGuideStyles(config.base, config.colors.line),
    [config.base, config.colors.line]
  )

  const containerStyles = React.useMemo(() => {
    // Process dimension values
    const widthValue = formatValue(width || containerWidth || 'auto')
    const heightValue = formatValue(height || containerHeight || 'auto')
    const maxWidthValue = formatValue(maxWidth || 'none')
    const columnWidthValue = formatValue(columnWidth || '60px')

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
        key: '--bkgc',
        value: `${columnsCount}`,
        defaultStyles,
      }),
      ...createStyleOverride({
        key: '--bkgb',
        value: `0`,
        defaultStyles,
      }),
      ...createStyleOverride({
        key: '--bkgcl',
        value: color ?? config.colors.line,
        defaultStyles,
      }),
      ...createStyleOverride({
        key: '--bkgg',
        value: `${calculatedGap}px`,
        defaultStyles,
      }),
      ...createStyleOverride({
        key: '--bkgj',
        value: align || 'center',
        defaultStyles,
      }),
      ...(template && template !== 'none' ? { '--bkgt': template } : {}),
      // Add grid template if available
      ...(template && template !== 'none'
        ? { gridTemplateColumns: template }
        : {}),
    } as React.CSSProperties

    return mergeStyles(customStyles, style)
  }, [
    width,
    height,
    maxWidth,
    columnWidth,
    columnsCount,
    color,
    template,
    calculatedGap,
    containerWidth,
    containerHeight,
    config.colors.line,
    defaultStyles,
    style,
    align,
  ])

  // In the component where gap is used:
  const handleGapCalculations = () => {
    // Ensure gap is a number
    const safeGap = typeof gap === 'number' ? gap : 0

    // When gap is 0, we need width + 1 columns to fill the space
    // When gap > 0, we need to account for the -1px reduction in each gap
    const finalGap = safeGap === 0 ? 0 : safeGap - 1
    const actualGapWithLine = finalGap + 1

    // Rest of the gap calculations...
    return { finalGap, actualGapWithLine }
  }

  // Use the gap calculations where needed
  const { finalGap, actualGapWithLine } = handleGapCalculations()

  // Ensure width is a number
  const containerWidthValue =
    typeof width === 'number' ? width : containerWidth || 1024

  // For line variants, account for the -1px reduction in each gap
  // If we have N columns, we have (N-1) gaps, each reduced by 1px
  // So the total width lost is (N-1) pixels
  let columnCount: number

  if (finalGap === 0) {
    // When gap is 0, we need a column per pixel + 1
    columnCount = Math.floor(containerWidthValue) + 1
  } else if (variant === 'line') {
    // For line variant with gap > 0:
    // We need to solve for N in: N * actualGapWithLine - (N-1) = containerWidthValue
    // Which simplifies to: N = (containerWidthValue + 1) / (actualGapWithLine - 1 + 1)
    columnCount = Math.max(
      1,
      Math.floor((containerWidthValue + 1) / actualGapWithLine) + 1
    )
  } else {
    // For other variants, use the standard formula
    columnCount = Math.max(
      1,
      Math.floor(containerWidthValue / actualGapWithLine) + 1
    )
  }

  return (
    <div
      ref={containerRef}
      data-testid="guide"
      className={mergeClasses(
        styles.gde,
        className,
        isShown ? styles.v : styles.h,
        variant === 'line' && styles.line
      )}
      data-variant={variant}
      style={containerStyles}
      {...props}
    >
      {isShown && (
        <div className={styles.cols} data-variant={variant}>
          {Array.from({ length: columnCount }, (_, i) => {
            const colColor =
              config.colors[variant as keyof typeof config.colors] ??
              config.colors.line
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
