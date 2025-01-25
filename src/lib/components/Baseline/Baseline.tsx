import { CSSProperties, memo, useCallback, useMemo, useRef } from 'react'
import { ComponentsProps } from '@components'
import {
  useConfig,
  useGuideDimensions,
  useNormalizedDimensions,
  useDebugging,
  useGuideVisibleLines,
} from '@hooks'
import {
  convertToPixels,
  normalizeSpacing,
} from '@utils'
import styles from './styles.module.css'

export type BaselineVariant = 'line' | 'flat';

/**
 * Props for the Baseline component.
 */
export type BaselineProps = {
  /**
   * Chooses between 1px lines (`"line"`) or thicker lines matching the base
   * spacing (`"flat"`). Defaults to the theme’s baseline variant if not specified.
   */
  variant?: BaselineVariant
} & ComponentsProps

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
  style,
  variant: variantProp,
  height,
  width,
  ...props
}: BaselineProps) {
  const config = useConfig('baseline')
  const variant = variantProp ?? config.variant

  // Determine if baseline lines should be shown
  const { isShown } = useDebugging(props.debugging, config.debugging)

  // Reference to measure the container's dimensions
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { width: containerWidth, height: containerHeight } = useGuideDimensions(containerRef)

  // Resolve the final overlay height in px
  const resolvedHeight = useMemo(() => {
    if (height !== undefined) {
      if (typeof height === 'number') {
        return height
      }
      const px = convertToPixels(height)
      return px ?? containerHeight
    }
    return containerHeight
  }, [height, containerHeight])

  // Normalize block/inline spacing if provided
  const spacing = useMemo(() => normalizeSpacing(props, config.base), [props, config.base])

  // Calculate how many total rows we need to render
  const rowCount = useMemo(() => {
    const totalHeight = (resolvedHeight ?? 0) - (spacing.block[0] + spacing.block[1])
    return Math.max(1, Math.ceil(totalHeight / config.base))
  }, [resolvedHeight, spacing.block, config.base])

  // Use custom hook to identify which rows are visible in the viewport
  const { start, end } = useGuideVisibleLines({
    totalLines: rowCount,
    lineHeight: config.base,
    containerRef,
  })

  // Normalize width if provided
  const { width: cssWidth } = useNormalizedDimensions({
    width,
    height,
    defaultWidth: containerWidth,
    defaultHeight: containerHeight,
    base: config.base,
  })

  // Choose line color based on variant
  const chosenColor = variant === 'line'
    ? config.colors.line
    : config.colors.flat

  // Build container style object
  const containerStyles = useMemo(
    () =>
      ({
        '--pdd-baseline-width': cssWidth,
        paddingBlock: `${spacing.block[0]}px ${spacing.block[1]}px`,
        paddingInline: `${spacing.inline[0]}px ${spacing.inline[1]}px`,
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        height: resolvedHeight ? `${resolvedHeight}px` : 'auto',
        ...style,
      } as CSSProperties),
    [cssWidth, spacing, resolvedHeight, style],
  )

  // Compute style for each row of the baseline
  const getRowStyle = useCallback(
    (index: number): CSSProperties => ({
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
      className={[
        styles.baseline,
        isShown ? styles.visible : styles.hidden,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={containerStyles}
      {...props}
    >
      {isShown &&
        Array.from({ length: end - start }, (_, i) => {
          const rowIndex = i + start
          return (
            <div
              key={rowIndex}
              data-row-index={rowIndex}
              style={getRowStyle(rowIndex)}
            />
          )
        })}
    </div>
  )
})