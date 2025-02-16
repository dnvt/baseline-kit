/**
 * @file Baseline Component
 * @description Horizontal grid overlay for baseline alignment
 * @module components
 */

import * as React from 'react'
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
export const Baseline = React.memo(function Baseline({
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

  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const { width: containerWidth, height: containerHeight } = useMeasure(containerRef)

  const [normWidth, normHeight] = React.useMemo(
    () => normalizeValuePair([widthProp, heightProp], [containerWidth, containerHeight]),
    [widthProp, heightProp, containerWidth, containerHeight],
  )

  const { top, right, bottom, left } = React.useMemo(() => parsePadding(spacingProps), [spacingProps])

  const rowCount = React.useMemo(() => {
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

  const containerStyles = React.useMemo(() => {
    const padding = [top, right, bottom, left]
      .map(value => (value ? `${value}px` : '0'))
      .join(' ')

    return mergeStyles({
      '--bkbw': normWidth ? `${normWidth}px` : '100%',
      '--bkbh': normHeight ? `${normHeight}px` : '100%',
      ...(padding !== '0 0 0 0' && { padding }),
    } as React.CSSProperties, style)
  }, [normWidth, normHeight, top, right, bottom, left, style])

  const getRowStyle = React.useCallback(
    (index: number) => {
      const defaultRowHeight = variant === 'line' ? '1px' : `${base}px`
      const defaultRowColor = variant === 'line' ? config.colors.line : config.colors.flat

      return mergeStyles({
        '--bkrt': `${index * base}px`,
        ...(defaultRowHeight !== '1px' && { '--bkrh': defaultRowHeight }),
        ...(chosenColor !== defaultRowColor && { '--bkbcl': chosenColor }),
      } as React.CSSProperties)
    },
    [base, variant, chosenColor, config.colors.line, config.colors.flat],
  )

  return (
    <div
      ref={containerRef}
      data-testid="baseline"
      className={mergeClasses(styles.bas, isShown ? styles.v : styles.h, className)}
      style={containerStyles}
      {...spacingProps}
    >
      {isShown &&
        Array.from({ length: end - start }, (_, i) => {
          const rowIndex = i + start
          return (
            <div className={styles.row} key={rowIndex} data-row-index={rowIndex} style={getRowStyle(rowIndex)} />
          )
        })}
    </div>
  )
})