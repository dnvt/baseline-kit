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
 * When no explicit dimensions are provided:
 * - width defaults to "100%"
 * - height defaults to "100%"
 *
 * @example
 * ```tsx
 * // Basic vertical spacing
 * <Spacer height="24px" />
 *
 * // Horizontal spacing with custom indicator
 * <Spacer
 *   width="32px"
 *   height="100%"
 *   debugging="visible"
 *   indicatorNode={(value, dim) => `${dim}: ${value}px`}
 * />
 *
 * // Custom variant with full dimensions
 * <Spacer
 *   variant="flat"
 *   width="100%"
 *   height="40px"
 *   debugging="visible"
 * />
 * ```
 */
export const Spacer = React.memo(function Spacer({
  height,
  width,
  indicatorNode,
  debugging,
  variant: variantProp,
  className,
  style,
  ...props
}: SpacerProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const config = useConfig('spacer')

  const { isShown } = useDebug(debugging, config.debugging)
  const variant = variantProp ?? config.variant

  const [normWidth, normHeight] = normalizeValuePair(
    [width, height],
    [0, 0],
    { base: config.base, suppressWarnings: true },
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
      '--bk-spacer-base': `${config.base}px`,
      '--bk-spacer-color-indice': config.colors.indice,
      '--bk-spacer-color-line': config.colors.line,
      '--bk-spacer-color-flat': config.colors.flat,
    } as React.CSSProperties
    return mergeStyles(styleObject, style)
  }, [cssHeight, cssWidth, config, style])

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