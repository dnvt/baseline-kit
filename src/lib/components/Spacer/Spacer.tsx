import * as React from 'react'
import { useConfig, useDebug } from '@hooks'
import { cs, cx, formatValue, normalizeValuePair } from '@utils'
import { ComponentsProps } from '../types'
import styles from './styles.module.css'

export type SpacerVariant = 'line' | 'flat' | 'pattern'
export type SpacerDimension = 'width' | 'height'

/**
 * Signature for a function that renders a custom indicator node
 * (e.g., measurement label) for the spacer's dimension in debug mode.
 *
 * @param value - The numerical measurement (in px) of the spacer's dimension.
 * @param dimension - The dimension type: 'width' or 'height'.
 * @returns A ReactNode representing the indicator to be displayed.
 */
export type IndicatorNode = (
  value: number,
  dimension: SpacerDimension,
) => React.ReactNode

export type SpacerProps = {
  /** Function that renders a custom indicator (e.g., a label) showing the spacer's measured dimensions */
  indicatorNode?: IndicatorNode
  /** Controls the visual style of the spacer */
  variant?: SpacerVariant
} & ComponentsProps

/**
 * Spacer - A flexible layout element that adds vertical or horizontal
 * space, optionally displaying measurement indicators in debug mode.
 *
 * @remarks
 * - **Dimension**: `width` and `height` can be any CSS unit (px, %, etc.).
 * - **Debugging**: Use the `indicatorNode` prop to show custom measurements
 *   when `debugging` is set to `"visible"` or `"hidden"`. For `"none"`, no debug
 *   visuals are rendered.
 * - **Variant**: Ties into theme styling with `"line"`, `"flat"`, or `"pattern"`
 *   to adapt how the spacer visually appears in debug mode.
 *
 * @example
 * ```tsx
 * <Spacer
 *   height="8px"
 *   variant="line"
 *   debugging="visible"
 *   indicatorNode={(val, dim) => <>{dim}: {val}px</>}
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

  // Normalize both width and height using normalizeValuePair with fallback [0, 0]
  const [normWidth, normHeight] = normalizeValuePair(
    [width, height],
    [0, 0],
    { base: config.base, suppressWarnings: true },
  )

  // Format CSS values but fallback to 100% if no value was passed
  const cssWidth = formatValue(normWidth || '100%')
  const cssHeight = formatValue(normHeight || '100%')

  // Measurement indicators for debug mode
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

  // Compose container styles using normalized values and theme config
  const containerStyles = React.useMemo(() => {
    const styleObject = {
      '--pdd-spacer-height': cssHeight,
      '--pdd-spacer-width': cssWidth,
      '--pdd-spacer-base': `${config.base}px`,
      '--pdd-spacer-color-indice': config.colors.indice,
      '--pdd-spacer-color-line': config.colors.line,
      '--pdd-spacer-color-flat': config.colors.flat,
    } as React.CSSProperties
    return cs(styleObject, style)
  }, [cssHeight, cssWidth, config, style])

  return (
    <div
      ref={ref}
      className={cx(
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