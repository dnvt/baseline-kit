/**
 * @file Baseline Component
 * @description Horizontal grid overlay for baseline alignment
 * @module components
 */

import { CSSProperties, memo, useCallback, useMemo, useRef } from 'react'
import { ComponentsProps } from '@components'
import { useConfig, useDebug, useVirtual, useMeasure } from '@hooks'
import { parsePadding, normalizeValuePair, mergeStyles, mergeClasses } from '@utils'
import { Variant } from '../types'
import styles from './styles.module.css'

export type BaselineVariant = Exclude<Variant, 'pattern'>

export type BaselineProps = {
  /** Visual style variant for the baseline guides */
  variant?: BaselineVariant;
  /** Explicit width for the overlay (e.g., "1200px" or 1200) */
  width?: number | string;
  /** Explicit height for the overlay (e.g., "100vh" or 800) */
  height?: number | string;
  /** Base unit for measurements (defaults to theme value) */
  base?: number;
} & ComponentsProps;

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
export const Baseline = memo(function Baseline({
  className,
  debugging,
  style,
  variant: variantProp,
  height: heightProp,
  width: widthProp,
  base: baseProp,
  ...spacingProps
}: BaselineProps) {
  const config = useConfig('baseline')
  const variant = variantProp ?? config.variant
  const base = baseProp ?? config.base
  const { isShown } = useDebug(debugging, config.debugging)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const { width: containerWidth, height: containerHeight } = useMeasure(containerRef)

  const [normWidth, normHeight] = useMemo(
    () => normalizeValuePair([widthProp, heightProp], [containerWidth, containerHeight]),
    [widthProp, heightProp, containerWidth, containerHeight],
  )

  const { top, right, bottom, left } = useMemo(() => parsePadding(spacingProps), [spacingProps])

  const rowCount = useMemo(() => {
    const totalHeight = (normHeight ?? 0) - (top + bottom)
    return Math.max(1, Math.floor(totalHeight / base))
  }, [normHeight, top, bottom, base])

  const { start, end } = useVirtual({
    totalLines: rowCount,
    lineHeight: base,
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
        top: `${index * base}px`,
        left: 0,
        right: 0,
        height: variant === 'line' ? '1px' : `${base}px`,
        backgroundColor: chosenColor,
        position: 'absolute',
      }),
    [base, variant, chosenColor],
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