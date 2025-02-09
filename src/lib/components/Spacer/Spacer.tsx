/**
 * @file Spacer Component
 * @description Flexible spacing element with measurement indicators
 * @module components
 */

import * as React from 'react'
import { useConfig, useDebug } from '@hooks'
import { mergeStyles, mergeClasses, formatValue, normalizeValuePair } from '@utils'
import { ComponentsProps, Variant } from '../types'
import styles from './styles.module.css'

/**
 * Function signature for custom measurement indicators.
 *
 * @param value - The measurement in pixels
 * @param dimension - Which dimension is being measured ('width' | 'height')
 * @returns React node to display as the indicator
 */
export type IndicatorNode = (
  value: number,
  dimension: 'width' | 'height',
) => React.ReactNode

export type SpacerProps = {
  /** Render function for custom measurement display */
  indicatorNode?: IndicatorNode;
  /** Visual style when debugging is enabled */
  variant?: Variant;
  /** Base unit for measurements (defaults to theme value) */
  base?: number;
  /** Color override for visual indicators */
  color?: string;
} & ComponentsProps

/**
 * A flexible layout element that adds precise vertical or horizontal spacing.
 *
 * @remarks
 * Spacer provides:
 * - Consistent spacing in layouts
 * - Optional measurement indicators for debugging
 * - Multiple visual styles for different debugging needs
 * - Automatic dimension normalization
 *
 * @example
 * ```tsx
 * // Basic vertical spacing
 * <Spacer
 *   height="24px"
 *   base={8}
 * />
 *
 * // Custom style with indicators
 * <Spacer
 *   width="32px"
 *   height="100%"
 *   base={4}
 *   color="#ff0000"
 *   debugging="visible"
 *   indicatorNode={(value, dim) => `${dim}: ${value}px`}
 * />
 * ```
 */
export const Spacer = React.memo(function Spacer({
  height,
  width,
  indicatorNode,
  debugging,
  variant: variantProp,
  base: baseProp,
  color: colorProp,
  className,
  style,
  ...props
}: SpacerProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const config = useConfig('spacer')

  const { isShown } = useDebug(debugging, config.debugging)
  const variant = variantProp ?? config.variant
  const base = baseProp ?? config.base

  const [normWidth, normHeight] = normalizeValuePair(
    [width, height],
    [0, 0],
    { base, suppressWarnings: true },
  )

  const cssWidth = formatValue(normWidth || '100%')
  const cssHeight = formatValue(normHeight || '100%')

  const measurements = React.useMemo(() => {
    if (!isShown || !indicatorNode) return null

    return [
      normHeight !== 0 && (
        <span key="height">
          {indicatorNode(normHeight, 'height')}
        </span>
      ),
      normWidth !== 0 && (
        <span key="width">
          {indicatorNode(normWidth, 'width')}
        </span>
      ),
    ].filter(Boolean)
  }, [isShown, indicatorNode, normHeight, normWidth])

  const containerStyles = React.useMemo(() => {
    const styleObject = {
      '--bk-spacer-height': cssHeight,
      '--bk-spacer-width': cssWidth,
      '--bk-spacer-base': `${base}px`,
      '--bk-spacer-color-indice': colorProp ?? config.colors.indice,
      '--bk-spacer-color-line': colorProp ?? config.colors.line,
      '--bk-spacer-color-flat': colorProp ?? config.colors.flat,
    } as React.CSSProperties
    return mergeStyles(styleObject, style)
  }, [cssHeight, cssWidth, base, colorProp, config.colors, style])

  return (
    <div
      ref={ref}
      className={
        mergeClasses(
          styles.spacer,
          isShown && styles[variant],
          className,
        )}
      data-testid="spacer"
      data-variant={variant}
      style={containerStyles}
      {...props}
    >
      {measurements}
    </div>
  )
})