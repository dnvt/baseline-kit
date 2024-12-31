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
    console.warn(
      `Best to pass a Spacer value as a multiple of the baseUnit.\nConverted: ${num} to ${normalized} to match the baseline`,
    )
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
  const heightMeasurement = height && isShown ? normalizeSpacerSize(height, baseUnit) : null
  const widthMeasurement = width && isShown ? normalizeSpacerSize(width, baseUnit) : null

  // Dimensions styles
  const normHeight = heightMeasurement ?? '100%'
  const normWidth = widthMeasurement ?? '100%'

  const combinedStyles = useMemo(() =>
    cs({
      '--spacer-height': parseCSSValue(normHeight),
      '--spacer-width': parseCSSValue(normWidth),
      '--spacer-base-unit': baseUnit,
      '--spacer-color': color,
      '--spacer-z-index': zIndex,
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
        showLineSpacer && styles.guides,
        showFlatSpacer && styles.guides,
        className,
      )}
      style={combinedStyles}
    >
      {heightMeasurement && renderMeasurement(heightMeasurement, 'height')}
      {widthMeasurement && renderMeasurement(widthMeasurement, 'width')}
    </div>
  )
})
