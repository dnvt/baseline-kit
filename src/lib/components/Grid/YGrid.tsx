import type { CSSProperties, RefObject } from 'react'
import { memo, useMemo, useRef, useCallback } from 'react'
import { Y_GRID as CONFIG } from '@config'
import { useGridDimensions, useVisibleGridLines } from '@hooks'
import { clamp, cx, cs, MeasurementSystem, normalizeGridUnit } from '@utils'

import type { YGProps, GridLineStyles, GridFlatStyles } from './types'
import styles from './styles.module.css'

/**
 * YGrid Component
 * A vertical row grid system that supports multiple layout variants:
 * 'flat', and 'line' (default).
 * @param config - Configuration object for the grid.
 * @param className - Additional class names for the container.
 * @param visibility - Visibility of the grid ('visible' or 'hidden').
 * @param style - Additional inline styles for the container.
 */
export const YGrid = memo(function YGrid({
  config = { variant: 'line' },
  className = '',
  visibility = CONFIG.visibility,
  style = {},
}: YGProps) {
  // Destructure configuration with default values from CONFIG
  const {
    baseUnit = CONFIG.baseUnit,
    color = CONFIG.color,
    height = CONFIG.height,
    variant = CONFIG.variant,
    zIndex = CONFIG.zIndex,
  } = config

  // Ref for the container to measure dimensions
  const containerRef = useRef<HTMLDivElement>(null)
  const { height: containerHeight } = useGridDimensions(containerRef)

  // Calculate the number of rows based on the grid height and base unit
  const rowCount = useMemo(() => {
    const totalHeight = typeof height === 'number' ? height : containerHeight
    const normalizedHeight = MeasurementSystem.normalize(totalHeight, { unit: baseUnit, suppressWarnings: true })

    // Clamp the number of rows to a reasonable range (1 to 1000)
    return clamp(Math.ceil(normalizedHeight / baseUnit), 1, 1000)
  }, [height, containerHeight, baseUnit])

  // Determine the range of visible rows based on the container's scroll position
  const visibleRange = useVisibleGridLines({
    totalLines: rowCount,
    lineHeight: baseUnit,
    containerRef: containerRef as RefObject<HTMLDivElement>,
  })

  // Generate styles for each row based on its index
  const getRowStyles = useCallback(
    (idx: number): Partial<CSSProperties & (GridLineStyles | GridFlatStyles)> => ({
      '--padd-grid-top': `${idx * baseUnit}px`,
      '--padd-grid-color': color,
      '--padd-grid-line-height': variant === 'line' ? '1px' : `${baseUnit}px`,
      '--padd-grid-opacity': variant === 'flat' && idx % 2 === 0 ? '0' : '1',
    }),
    [baseUnit, color, variant],
  )

  // Calculate the class name for individual rows
  const rowClassName = useMemo(() =>
    cx(styles.row, variant === 'flat' && styles.flat),
  [variant],
  )

  // Generate the visible rows based on the visible range
  const visibleRows = useMemo(() => {
    const rows = []
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      rows.push(
        <div
          key={i}
          className={rowClassName}
          style={getRowStyles(i)}
          data-row-index={i}
        />,
      )
    }
    return rows
  }, [visibleRange.start, visibleRange.end, rowClassName, getRowStyles])

  // Determine whether the grid should be shown
  const isShown = visibility === 'visible'

  // Memoized class names for the container
  const containerClassName = useMemo(() =>
    cx(
      styles['ygrid-container'],
      className,
      isShown ? styles.visible : styles.hidden,
    ),
  [className, isShown],
  )

  // Process the height value to ensure it's in the correct format
  const processedHeight = useMemo(() => {
    if (height === undefined) return '100%'
    if (typeof height === 'number') return `${height}px`
    if (typeof height === 'string') {
      // Only normalize non-relative units
      if (height.endsWith('%') || height === 'auto' || height.endsWith('vh') || height.endsWith('vw')) {
        return height
      }
      return normalizeGridUnit(height)
    }
    return height
  }, [height])

  // Memoized inline styles for the container
  const containerStyles = useMemo(() =>
    cs({
      '--padd-height': processedHeight,
      '--padd-z-index': zIndex,
      '--padd-grid-color': color,
    } as CSSProperties, style),
  [processedHeight, zIndex, color, style])

  return isShown ? (
    <div
      ref={containerRef}
      className={containerClassName}
      data-testid="ygrid-container"
      data-variant={variant}
      style={containerStyles}
    >
      {visibleRows}
    </div>
  ) : null
})
