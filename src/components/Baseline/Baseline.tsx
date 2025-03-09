import * as React from 'react'
import { ComponentsProps } from '@components'
import { useConfig, useDebug, useVirtual, useMeasure } from '@hooks'
import {
  parsePadding,
  normalizeValuePair,
  mergeStyles,
  mergeClasses,
  calculateRowCount,
  formatValue,
  createStyleOverride,
  ClientOnly,
} from '@utils'
import { Variant } from '../types'
import styles from './styles.module.css'

export type BaselineVariant = Exclude<Variant, 'pattern'>

export type BaselineProps = {
  /** Visual style variant for the baseline guides */
  variant?: BaselineVariant
  /** Explicit width for the overlay (e.g., "1200px" or 1200) */
  width?: number | string
  /** Explicit height for the overlay (e.g., "100vh" or 800) */
  height?: number | string
  /** Base unit for measurements (defaults to theme value) */
  base?: number
  /** Color override for grid lines */
  color?: string
  /** Flag to enable SSR-compatible mode (simplified initial render) */
  ssrMode?: boolean
} & ComponentsProps

// Utils -----------------------------------------------------------------------

/** Creates default baseline styles */
export const createDefaultBaselineStyles = (
  base: number,
  lineColor: string,
  flatColor: string
): Record<string, string> => ({
  '--bkbw': '100%',
  '--bkbh': '100%',
  '--bkbb': `${base}px`,
  '--bkbcl': lineColor,
  '--bkbcf': flatColor,
})

/** Create row styles for baseline lines */
type RowStyleParams = {
  /** Row index */
  index: number
  /** Base unit for calculations */
  base: number
  /** Baseline visual variant */
  variant: BaselineVariant
  /** Selected color for the baseline */
  chosenColor: string
  /** Theme line color */
  lineColor: string
  /** Theme flat color */
  flatColor: string
}

/**
 * Creates styles for an individual baseline row.
 * Applies positioning and visual styling based on variant.
 */
export const createBaselineRowStyle = (
  params: RowStyleParams
): React.CSSProperties => {
  const { index, base, variant, chosenColor, lineColor, flatColor } = params

  // Directly set the CSS variables instead of using createStyleOverride
  return {
    '--bkrt': index === 0 ? '0px' : `${index * base}px`,
    '--bkrh': variant === 'line' ? '1px' : `${base}px`,
    '--bkbc': chosenColor || (variant === 'line' ? lineColor : flatColor),
  } as React.CSSProperties
}

/**
 * Renders horizontal guidelines for maintaining vertical rhythm and baseline alignment.
 *
 * @remarks
 * Baseline provides horizontal guides that:
 * - Help maintain consistent vertical spacing
 * - Support visual verification of baseline alignment
 * - Optimize performance through virtual rendering
 * - Adapt to container dimensions
 *
 * @example
 * ```tsx
 * // Basic baseline overlay
 * <Baseline
 *   height="100vh"
 *   base={8}
 *   debugging="visible"
 * />
 *
 * // Custom variant with padding
 * <Baseline
 *   variant="flat"
 *   height="100vh"
 *   base={4}
 *   block={[16, 0]}
 *   debugging="visible"
 * />
 * ```
 */
export const Baseline = React.memo(function Baseline({
  className,
  debugging,
  style,
  variant: variantProp,
  height: heightProp,
  width: widthProp,
  base: baseProp,
  color: colorProp,
  ssrMode = false,
  ...spacingProps
}: BaselineProps) {
  const config = useConfig('baseline')
  const variant = variantProp ?? config.variant
  const base = baseProp ?? config.base
  const { isShown } = useDebug(debugging, config.debugging)

  // If debugging isn't enabled, render a hidden element
  // This ensures tests can find the element even when hidden
  if (!isShown) {
    return (
      <div
        className={mergeClasses(styles.b, styles.h, className)}
        style={style}
        data-testid="baseline"
        {...spacingProps}
      />
    )
  }

  // Create a simple SSR fallback
  const ssrFallback = (
    <div
      className={mergeClasses(styles.b, styles.h, styles.ssr, className)}
      style={{
        width: widthProp || '100%',
        height: heightProp || '100%',
        ...style,
      }}
      data-testid="baseline"
    />
  )

  // Wrap the actual implementation in ClientOnly
  return (
    <ClientOnly fallback={ssrFallback}>
      <BaselineImpl
        className={className}
        debugging={debugging}
        style={style}
        variant={variant}
        height={heightProp}
        width={widthProp}
        base={base}
        color={colorProp}
        ssrMode={ssrMode}
        {...spacingProps}
      />
    </ClientOnly>
  )
})

// Implementation component that only renders on the client side
const BaselineImpl = React.memo(function BaselineImpl({
  className,
  debugging,
  style,
  variant,
  height: heightProp,
  width: widthProp,
  base,
  color: colorProp,
  ssrMode: _ssrMode = false,
  ...spacingProps
}: BaselineProps) {
  const config = useConfig('baseline')
  const { isShown } = useDebug(debugging, config.debugging)

  // Use a stable reference that won't cause hydration mismatches
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  // Always call hooks, but conditionally use their results
  const {
    width: containerWidth,
    height: containerHeight,
    refresh,
  } = useMeasure(containerRef)

  // Effect for handling window resize events
  React.useEffect(() => {
    const handleResize = () => {
      refresh()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [refresh])

  const [_normWidth, normHeight] = React.useMemo(() => {
    return normalizeValuePair(
      [widthProp, heightProp],
      [containerWidth, containerHeight]
    )
  }, [widthProp, heightProp, containerWidth, containerHeight])

  const { top, right, bottom, left } = React.useMemo(
    () => parsePadding(spacingProps),
    [spacingProps]
  )

  const padding = React.useMemo(() => {
    const paddingValues = [top, right, bottom, left]
      .map((value) => (value ? `${value}px` : '0'))
      .join(' ')

    return paddingValues !== '0 0 0 0' ? paddingValues : undefined
  }, [top, right, bottom, left])

  const rowCount = React.useMemo(() => {
    const baseValue = base || config.base
    return calculateRowCount({
      height: normHeight,
      top,
      bottom,
      base: baseValue,
    })
  }, [normHeight, top, bottom, base, config.base])

  // Use virtual rendering for performance
  const { start, end } = useVirtual({
    totalLines: rowCount,
    lineHeight: base || config.base,
    containerRef,
    buffer: 160,
  })

  const chosenColor =
    colorProp || (variant === 'line' ? config.colors.line : config.colors.flat)

  // Create default baseline styles
  const defaultBaselineStyles = React.useMemo(
    () =>
      createDefaultBaselineStyles(
        base || config.base,
        config.colors.line,
        config.colors.flat
      ),
    [base, config.colors.line, config.colors.flat, config.base]
  )

  const containerStyles = React.useMemo(() => {
    const widthValue = formatValue(widthProp || '100%')
    const heightValue = formatValue(heightProp || '100%')

    // Define dimensions that should be skipped when set to 100%
    const dimensionVars = ['--bkbw', '--bkbh']

    return mergeStyles(
      {
        ...createStyleOverride({
          key: '--bkbw',
          value: widthValue,
          defaultStyles: defaultBaselineStyles,
          skipDimensions: { fullSize: dimensionVars },
        }),
        ...createStyleOverride({
          key: '--bkbh',
          value: heightValue,
          defaultStyles: defaultBaselineStyles,
          skipDimensions: { fullSize: dimensionVars },
        }),
        ...createStyleOverride({
          key: '--bkbb',
          value: `${base}px`,
          defaultStyles: defaultBaselineStyles,
        }),
        ...createStyleOverride({
          key: '--bkbcl',
          value: colorProp || config.colors.line,
          defaultStyles: defaultBaselineStyles,
        }),
        ...createStyleOverride({
          key: '--bkbcf',
          value: colorProp || config.colors.flat,
          defaultStyles: defaultBaselineStyles,
        }),
        ...(padding && { padding }),
      } as React.CSSProperties,
      style
    )
  }, [
    widthProp,
    heightProp,
    base,
    colorProp,
    config.colors.line,
    config.colors.flat,
    padding,
    defaultBaselineStyles,
    style,
  ])

  const getRowStyle = React.useCallback(
    (index: number) => {
      // Ensure variant is a BaselineVariant
      const safeVariant = variant as BaselineVariant
      const safeBase = base || config.base

      return createBaselineRowStyle({
        index,
        base: safeBase,
        variant: safeVariant,
        chosenColor,
        lineColor: config.colors.line,
        flatColor: config.colors.flat,
      })
    },
    [
      base,
      variant,
      chosenColor,
      config.colors.line,
      config.colors.flat,
      config.base,
    ]
  )

  return (
    <div
      ref={containerRef}
      data-testid="baseline"
      className={mergeClasses(
        styles.bas,
        isShown ? styles.v : styles.h,
        className
      )}
      style={containerStyles}
      {...spacingProps}
    >
      {isShown &&
        Array.from({ length: end - start }, (_, i) => {
          const rowIndex = i + start
          return (
            <div
              className={styles.row}
              key={rowIndex}
              data-row-index={rowIndex}
              style={getRowStyle(rowIndex)}
            />
          )
        })}
    </div>
  )
})
