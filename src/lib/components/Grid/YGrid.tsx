import type { CSSProperties, RefObject } from 'react'
import { memo, useMemo, useRef, useCallback } from 'react'
import { Y_GRID as CONFIG } from '@config'
import { useGridDimensions, useVisibleGridLines } from '@hooks'
import { clamp, cx, cs, MeasurementSystem, normalizeGridUnit } from '@utils'

import type { YGProps, GridLineStyles, GridFlatStyles } from './types'
import styles from './styles.module.css'

export const YGrid = memo(function YGrid({
  config = { variant: 'line' },
  className = '',
  visibility = CONFIG.visibility,
  style = {},
}: YGProps) {
  const {
    baseUnit = CONFIG.baseUnit,
    color = CONFIG.color,
    height = CONFIG.height,
    variant = CONFIG.variant,
    zIndex = CONFIG.zIndex,
  } = config

  const containerRef = useRef<HTMLDivElement>(null)
  const { height: containerHeight } = useGridDimensions(containerRef)

  const rowCount = useMemo(() => {
    const totalHeight = typeof height === 'number' ? height : containerHeight
    const normalizedHeight = MeasurementSystem.normalize(totalHeight, { unit: baseUnit, suppressWarnings: true })

    return clamp(Math.ceil(normalizedHeight / baseUnit), 1, 1000)
  }, [height, containerHeight, baseUnit])

  const visibleRange = useVisibleGridLines({
    totalLines: rowCount,
    lineHeight: baseUnit,
    containerRef: containerRef as RefObject<HTMLDivElement>,
  })

  const getRowStyles = useCallback(
    (idx: number): Partial<CSSProperties & (GridLineStyles | GridFlatStyles)> => ({
      '--padd-grid-top': `${idx * baseUnit}px`,
      '--padd-grid-color': color,
      '--padd-grid-line-height': variant === 'line' ? '1px' : `${baseUnit}px`,
      '--padd-grid-opacity': variant === 'flat' && idx % 2 === 0 ? '0' : '1',
    }),
    [baseUnit, color, variant],
  )

  const rowClassName = useMemo(() =>
    cx(styles.row, variant === 'flat' && styles.flat),
  [variant],
  )

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

  const isShown = visibility === 'visible'

  const containerClassName = useMemo(() =>
    cx(
      styles['ygrid-container'],
      className,
      isShown ? styles.visible : styles.hidden,
    ),
  [className, isShown],
  )

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
