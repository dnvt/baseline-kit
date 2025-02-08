import { CSSProperties, memo, useCallback, useMemo, useRef } from 'react'
import { ComponentsProps } from '@components'
import { useConfig, useDebug, useVirtual, useMeasure } from '@hooks'
import { parsePadding, normalizeValuePair, mergeStyles, mergeClasses } from '@utils'
import { Variant } from '../types'
import styles from './styles.module.css'

export type BaselineVariant = Exclude<Variant, 'pattern'>

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

  const containerRef = useRef<HTMLDivElement | null>(null)
  const { width: containerWidth, height: containerHeight } = useMeasure(containerRef)

  const [normWidth, normHeight] = useMemo(
    () => normalizeValuePair([widthProp, heightProp], [containerWidth, containerHeight]),
    [widthProp, heightProp, containerWidth, containerHeight],
  )

  const { top, right, bottom, left } = useMemo(() => parsePadding(spacingProps), [spacingProps])

  // Calculate the number of rows (lines) to render:
  // Subtract vertical padding (top + bottom) from the normalized height.
  const rowCount = useMemo(() => {
    const totalHeight = (normHeight ?? 0) - (top + bottom)
    return Math.max(1, Math.floor(totalHeight / config.base))
  }, [normHeight, top, bottom, config.base])

  const { start, end } = useVirtual({
    totalLines: rowCount,
    lineHeight: config.base,
    containerRef,
    buffer: 160,
  })

  const chosenColor = variant === 'line' ? config.colors.line : config.colors.flat

  const containerStyles = useMemo(
    () =>
      mergeStyles({
        '--bk-baseline-width': normWidth,
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

  const getRowStyle = useCallback(
    (index: number): CSSProperties =>
      mergeStyles({
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
      className={mergeClasses(styles.baseline, isShown ? styles.visible : styles.hidden, className)}
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