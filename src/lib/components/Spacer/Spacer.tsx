import { memo, useMemo, CSSProperties, ReactNode } from 'react'
import { useConfig, useNormalizedDimensions, useDebugging } from '@hooks'
import { cs, cx } from '@utils'
import { ComponentsProps } from '../types'
import styles from './styles.module.css'

export type SpacerVariant = 'line' | 'flat' | 'pattern';
export type SpacerDimension = 'width' | 'height';

/**
 * Signature for a function that renders a custom indicator node
 * (e.g., measurement label) for the spacer's dimension in debug mode.
 *
 * @param value - The numerical measurement (in px) of the spacer's dimension.
 * @param dimension - The dimension type: 'width' or 'height'.
 * @returns A ReactNode representing the indicator to be displayed.
 */
export type IndicatorNode = (value: number, dimension: SpacerDimension) => ReactNode;

export type SpacerProps = {
  /**
   * An optional function that renders a custom indicator (e.g., a label)
   * showing the spacer's measured dimensions. Only displayed if
   * `debugging` is not "none".
   */
  indicatorNode?: IndicatorNode;

  /**
   * Controls the visual style of the spacer, choosing from one of the
   * theme-defined variants: "line", "flat", or "pattern".
   * If omitted, it falls back to the theme's default variant.
   */
  variant?: SpacerVariant;
} & ComponentsProps

/**
 * Spacer - A flexible layout element that adds vertical or horizontal
 * space, optionally displaying measurement indicators in debug mode.
 *
 * @remarks
 * - **Dimension**: `width` and `height` can be any CSS unit (px, %, etc.).
 * - **Debugging**: Use the `indicatorNode` prop to show custom measurements
 *   when `debugging` is `"hidden"` or `"visible"`. For `"none"`, no debug
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
export const Spacer = memo(function Spacer({
  height,
  width,
  indicatorNode,
  debugging,
  variant: variantProp,
  className,
  style,
  ...props
}: SpacerProps) {
  const config = useConfig('spacer')
  const { isShown } = useDebugging(debugging, config.debugging)
  // Determine final spacer variant from prop or theme fallback
  const variant = variantProp ?? config.variant

  // Use hook to normalize width/height to valid CSS + numeric values
  const {
    width: cssWidth,
    height: cssHeight,
    normalizedWidth,
    normalizedHeight,
  } = useNormalizedDimensions({
    width,
    height,
    defaultWidth: 0,
    defaultHeight: 0,
    base: config.base,
  })

  // Conditionally render measurement indicators only if debug is shown
  const measurements = useMemo(() => {
    if (!isShown || !indicatorNode) return null

    return [
      normalizedHeight !== 0 && (
        <span key="height">
          {indicatorNode(normalizedHeight, 'height')}
        </span>
      ),
      normalizedWidth !== 0 && (
        <span key="width">
          {indicatorNode(normalizedWidth, 'width')}
        </span>
      ),
    ].filter(Boolean)
  }, [isShown, indicatorNode, normalizedHeight, normalizedWidth])

  // Construct inline styles with theme-based CSS variables
  const containerStyles = useMemo(() => {
    const styleObject = {
      '--pdd-spacer-height': cssHeight,
      '--pdd-spacer-width': cssWidth,
      '--pdd-spacer-base': `${config.base}px`,
      '--pdd-spacer-color-indice': config.colors.indice,
      '--pdd-spacer-color-line': config.colors.line,
      '--pdd-spacer-color-flat': config.colors.flat,
    } as CSSProperties

    return cs(styleObject, style)
  }, [cssHeight, cssWidth, config, style])

  return (
    <div
      className={cx(
        styles.spacer,
        styles[variant], // Apply variant-specific class
        isShown ? styles.visible : styles.hidden, // Show Spacer if debugging is visible
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