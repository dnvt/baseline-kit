import * as React from 'react'
import { useConfig, useDebug } from '@hooks'
import {
  mergeStyles,
  mergeClasses,
  formatValue,
  normalizeValuePair,
  createStyleOverride,
  hydratedValue
} from '@utils'
import { ComponentsProps, Variant } from '../types'
import styles from './styles.module.css'

// Type Definitions ------------------------------------------------------------

export type IndicatorNode = (value: number, type: 'width' | 'height') => React.ReactNode

export type SpacerProps = {
  /** Explicit width (takes precedence over block) */
  width?: React.CSSProperties['width']
  /** Explicit height (takes precedence over block) */
  height?: React.CSSProperties['height']
  /** Visual style in debug mode */
  variant?: Variant
  /** Color to use for debug visuals (overrides theme) */
  color?: string
  /** Base unit for measurements (defaults to theme value) */
  base?: number
  /** Custom content to render (for debugging info) */
  children?: React.ReactNode
  /** Custom indicator node rendering function */
  indicatorNode?: IndicatorNode
  /** Flag to enable SSR-compatible mode (simplified initial render) */
  ssrMode?: boolean
} & ComponentsProps

// Utils -----------------------------------------------------------------------

/** Creates default spacer styles */
export const createDefaultSpacerStyles = (
  base: number,
  textColor: string,
  flatColor: string,
  lineColor: string,
): Record<string, string> => ({
  '--bksw': '100%',
  '--bksh': '100%',
  '--bksb': `${base}px`,
  '--bksci': textColor,
  '--bkscl': lineColor,
  '--bkscf': flatColor,
})

/** Generates measurement indicators for debugging */
export const generateMeasurements = (
  isShown: boolean,
  indicatorNode: SpacerProps['indicatorNode'],
  normWidth: number | string,
  normHeight: number | string,
): React.ReactNode | null => {
  if (!isShown || !indicatorNode) return null

  const width = typeof normWidth === 'number' ? normWidth : 0
  const height = typeof normHeight === 'number' ? normHeight : 0

  return (
    <>
      {height !== 0 && (
        <span key="height">
          {indicatorNode(height, 'height')}
        </span>
      )}
      {width !== 0 && (
        <span key="width">
          {indicatorNode(width, 'width')}
        </span>
      )}
    </>
  )
}

/**
 * Creates empty space for implementing margins, gaps, and spacing.
 *
 * @remarks
 * - Flexible sizing: Set width and height directly
 * - Normalized values: All inputs convert to base unit multiples
 * - Debug visuals: Shows spacing measurements with theming
 * - Automatic: Empty in production, visible in debug mode
 *
 * @example
 * ```tsx
 * // Fixed size spacer
 * <Spacer width={32} height={16} />
 *
 * // Percentage-based spacer with debug hints
 * <Spacer
 *   width="50%"
 *   height={32}
 *   debugging="visible"
 *   variant="line"
 * />
 *
 * // Full-width spacer
 * <Spacer height={64} />
 * ```
 */
export const Spacer = React.memo(function Spacer({
  height: heightProp,
  width: widthProp,
  indicatorNode,
  debugging: debuggingProp,
  variant: variantProp,
  base: baseProp,
  color: colorProp,
  className,
  style,
  children,
  ssrMode = false,
  ...props
}: SpacerProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const config = useConfig('spacer')

  const { isShown, debugging } = useDebug(debuggingProp, config.debugging)
  const variant = variantProp ?? config.variant
  const base = baseProp ?? config.base

  // Add hydration state tracking
  const [isHydrated, setIsHydrated] = React.useState(false)
  
  React.useEffect(() => {
    setIsHydrated(true)
  }, [])

  const [normWidth, normHeight] = React.useMemo(() => {
    return normalizeValuePair(
      [widthProp, heightProp],
      [0, 0],
      { base, suppressWarnings: true }
    )
  }, [widthProp, heightProp, base])

  // Ensure stable rendering for measurements during SSR
  const shouldShowMeasurements = hydratedValue(
    isHydrated && !ssrMode,
    false, // Don't show measurements during SSR
    isShown && (indicatorNode !== undefined)
  )

  // Only generate measurements after hydration
  const measurements = React.useMemo(() => {
    if (!shouldShowMeasurements) {
      return null
    }

    return generateMeasurements(
      isShown,
      indicatorNode,
      normWidth,
      normHeight
    )
  }, [shouldShowMeasurements, isShown, indicatorNode, normWidth, normHeight])

  const defaultStyles = React.useMemo(
    () =>
      createDefaultSpacerStyles(
        base,
        config.colors.text,
        config.colors.flat,
        config.colors.line,
      ),
    [base, config.colors],
  )

  const baseStyles = React.useMemo(() => {
    const heightValue = formatValue(normHeight || '100%')
    const widthValue = formatValue(normWidth || '100%')
    const baseValue = `${base}px`

    // Define dimensions that should be skipped when set to 100%
    const dimensionVars = ['--bksw', '--bksh']

    const customStyles = {
      ...createStyleOverride({
        key: '--bksh',
        value: heightValue,
        defaultStyles,
        skipDimensions: { fullSize: dimensionVars },
      }),
      ...createStyleOverride({
        key: '--bksw',
        value: widthValue,
        defaultStyles,
        skipDimensions: { fullSize: dimensionVars },
      }),
      // Explicitly set --bksb to ensure it is always applied
      '--bksb': baseValue,
      ...createStyleOverride({
        key: '--bksci',
        value: colorProp ?? config.colors.text,
        defaultStyles,
      }),
      ...createStyleOverride({
        key: '--bkscl',
        value: colorProp ?? config.colors.line,
        defaultStyles,
      }),
      ...createStyleOverride({
        key: '--bkscf',
        value: colorProp ?? config.colors.flat,
        defaultStyles,
      }),
    } as React.CSSProperties

    return mergeStyles(customStyles, style)
  }, [
    normWidth,
    normHeight,
    colorProp,
    base,
    config.colors,
    defaultStyles,
    style,
  ])

  return (
    <div
      ref={ref}
      data-testid="spacer"
      className={mergeClasses(styles.spr, isShown && styles[variant], className)}
      data-variant={variant}
      style={baseStyles}
      {...props}
    >
      {measurements}
      {children}
    </div>
  )
})
