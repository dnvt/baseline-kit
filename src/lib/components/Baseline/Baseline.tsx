import { CSSProperties, memo, useCallback, useMemo, useRef } from 'react'
import { ComponentsProps } from '@components'
import { useConfig, useDebug, useVirtual, useMeasure } from '@hooks'
import { cs, cx, parsePadding, normalizeValuePair } from '@utils'
import styles from './styles.module.css'

export type BaselineVariant = 'line' | 'flat';

export type BaselineProps = {
  /** Defines the visual variant of the baseline. */
  variant?: BaselineVariant;
  /** Optional explicit width for the baseline overlay (e.g., "1200px" or 1200). */
  width?: number | string;
  /** Optional explicit height for the baseline overlay (e.g., "100vh" or 800). */
  height?: number | string;
} & ComponentsProps;

/**
 * Baseline - An overlay that draws horizontal lines from top to bottom,
 * helping you visualize the baseline grid. Only the currently visible
 * lines are rendered, improving performance on large or scrolling pages.
 *
 * @remarks
 * - **Variants**:
 *   - `"line"` => Each row is rendered as a 1px line.
 *   - `"flat"` => Each row is as tall as `base` px, providing a thicker guide.
 * - **Debugging**: If `debugging` is set to `"visible"`, the lines
 *   are displayed; otherwise, they remain hidden.
 * - **Layout**: Positioned absolutely so it won't affect your normal layout flow.
 * - **Spacing**: You can apply block/inline or padding props, ensuring the baseline
 *   aligns properly with your content’s spacing.
 *
 * @example
 * ```tsx
 * <Baseline variant="line" debugging="visible" height="100vh" />
 * ```
 */
export const Baseline = memo(function Baseline({
  className,
  debugging,
  style,
  variant: variantProp,
  height: heightProp,
  width: widthProp,
  ...spacingProps
}: BaselineProps) {
  const config = useConfig('baseline')
  const variant = variantProp ?? config.variant
  const { isShown } = useDebug(debugging, config.debugging)

  // Reference to measure the container's dimensions
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { width: containerWidth, height: containerHeight } = useMeasure(containerRef)

  // Normalize the provided width/height props against the measured container dimensions.
  // We use our new normalizeValuePair function from the conversion module.
  const [normWidth, normHeight] = useMemo(
    () =>
      normalizeValuePair(
        [widthProp, heightProp],
        [containerWidth, containerHeight],
      ),
    [widthProp, heightProp, containerWidth, containerHeight],
  )

  // Parse spacing props (e.g. padding, block, inline) into an object with top, right, bottom, left.
  const { top, right, bottom, left } = useMemo(() => parsePadding(spacingProps), [spacingProps])

  // Calculate the number of rows (lines) to render:
  // Subtract vertical padding (top + bottom) from the normalized height.
  const rowCount = useMemo(() => {
    const totalHeight = (normHeight ?? 0) - (top + bottom)
    // Use floor so that we get a consistent number of full rows.
    return Math.max(1, Math.floor(totalHeight / config.base))
  }, [normHeight, top, bottom, config.base])

  // Use virtual lines hook to determine which rows are visible.
  const { start, end } = useVirtual({
    totalLines: rowCount,
    lineHeight: config.base,
    containerRef,
    buffer: 160,
  })

  // Choose the baseline color based on the variant.
  const chosenColor = variant === 'line' ? config.colors.line : config.colors.flat

  // Build the container style, using our normalized dimensions and parsed padding.
  const containerStyles = useMemo(
    () =>
      cs({
        '--pdd-baseline-width': normWidth,
        padding: `${top}px ${right}px ${bottom}px ${left}px`,
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        height: `${normHeight}px`,
      } as CSSProperties,
      style,
      ),
    [normWidth, top, right, bottom, left, normHeight, style],
  )

  // Compute the style for each row.
  const getRowStyle = useCallback(
    (index: number): CSSProperties =>
      cs({
        top: `${index * config.base}px`,
        left: 0,
        right: 0,
        height: variant === 'line' ? '1px' : `${config.base}px`,
        backgroundColor: chosenColor,
        position: 'absolute',
      }),
    [config.base, variant, chosenColor],
  )

  return (
    <div
      ref={containerRef}
      data-testid="baseline"
      className={cx(styles.baseline, isShown ? styles.visible : styles.hidden, className)}
      style={containerStyles}
      {...spacingProps}
    >
      {isShown &&
        Array.from({ length: end - start }, (_, i) => {
          const rowIndex = i + start
          return (
            <div key={rowIndex} data-row-index={rowIndex} style={getRowStyle(rowIndex)} />
          )
        })}
    </div>
  )
})