import { memo, useMemo } from 'react'

import { CSSCustomProperties, CSSPixelValue } from '@types'
import { cs, cx, extractCSSNumber, parseCSSValue } from '@utils'

import { Measurement, SpacerProps } from './types'
import styles from './styles.module.css'
import { SPACER } from '@config'

function normalizeSpacerSize(size: CSSPixelValue, baseUnit: number) {
  const num = extractCSSNumber(size)
  const normalized = num - (num % baseUnit)

  if (normalized !== num) {
    console.error(`Best to pass a Spacer value as a multiple of the baseUnit.\nConverted: ${num} to ${normalized} to match the baseline`)
  }

  return normalized
}

export const Spacer = memo(function Spacer({
  height,
  width,
  config,
  measureRenderer,
  visibility = SPACER.visibility,
  className = '',
  style = {},
}: SpacerProps) {

  const {
    baseUnit = SPACER.baseUnit,
    color = SPACER.color,
    variant = SPACER.variant,
    zIndex = SPACER.zIndex,
  } = config || {}

  const isShown = visibility === 'visible'
  const showLineSpacer = isShown && variant === 'line'
  const showFlatSpacer = isShown && variant === 'flat'

  // Dimensions measurements
  const heightMeasurement = height ? normalizeSpacerSize(height, baseUnit) : null
  const widthMeasurement = width ? normalizeSpacerSize(width, baseUnit) : null

  // Dimensions styles
  const normHeight = heightMeasurement ?? '100%'
  const normWidth = widthMeasurement ?? '100%'

  const combinedStyles = useMemo(() =>
    cs({
      '--padd-spacer-height': parseCSSValue(normHeight),
      '--padd-spacer-width': parseCSSValue(normWidth),
      '--padd-base-unit': baseUnit,
      '--padd-spacer-color': color,
      '--padd-z-index': zIndex,
    } as CSSCustomProperties, style),
  [normHeight, normWidth, baseUnit, color, zIndex, style])

  const renderMeasurement = (value: number, measurement: Measurement) => {
    if (!measureRenderer) return null
    return measureRenderer(value, measurement)
  }

  return (
    <div
      className={cx(
        styles.spacer,
        showLineSpacer && styles.border,
        showFlatSpacer && styles.flat,
        className,
      )}
      data-testid="spacer-container"
      data-variant={variant}
      style={combinedStyles}
    >
      {isShown && heightMeasurement && renderMeasurement(heightMeasurement, 'height')}
      {isShown && widthMeasurement && renderMeasurement(widthMeasurement, 'width')}
    </div>
  )
})
