import { memo, ReactNode, useMemo } from 'react'
import { SPACER } from '@config'
import { CSSCustomProperties, CSSPixelValue, isFlatVariant, isLineVariant } from '@types'
import { cs, cx, extractCSSNumber, parseCSSValue } from '@utils'

import { SpacerDimensions, SpacerProps } from './types'
import styles from './styles.module.css'

function normalizeSpacerSize(size: CSSPixelValue, baseUnit: number) {
  const num = extractCSSNumber(size)
  const normalized = num - (num % baseUnit)

  if (normalized !== num) {
    console.warn(`Best to pass a Spacer value as a multiple of the baseUnit.\nConverted: ${num} to ${normalized} to match the baseline`)
  }

  return normalized
}

export const Spacer = memo(function Spacer({
  height,
  width,
  config = {},
  indicatorNode,
  visibility = SPACER.visibility,
  className = '',
  style = {},
}: SpacerProps) {
  const {
    baseUnit = SPACER.baseUnit,
    variant = SPACER.variant,
    zIndex = SPACER.zIndex,
    color: customColor,
  } = config

  const isShown = visibility === 'visible'

  const dimensions: SpacerDimensions = useMemo(() => {
    if (isLineVariant(config)) {
      return {
        height: '100%',
        width: '100%',
      }
    }

    if (isFlatVariant(config)) {
      return {
        height: height ? normalizeSpacerSize(height, baseUnit) : '100%',
        width: width ? normalizeSpacerSize(width, baseUnit) : '100%',
      }
    }

    // Default dimensions
    return {
      height: height ? normalizeSpacerSize(height, baseUnit) : '100%',
      width: width ? normalizeSpacerSize(width, baseUnit) : '100%',
    }
  }, [config, height, width, baseUnit])


  const measurements = useMemo(() => {
    if (!isShown || !indicatorNode) return null

    const result: ReactNode[] = []

    if (typeof dimensions.height === 'number') {
      const measurement = indicatorNode(dimensions.height, 'height')
      if (measurement) result.push(measurement)
    }

    if (typeof dimensions.width === 'number') {
      const measurement = indicatorNode(dimensions.width, 'width')
      if (measurement) result.push(measurement)
    }

    return result
  }, [isShown, indicatorNode, dimensions])

  const combinedStyles = useMemo(() => {
    const baseStyles = {
      '--padd-spacer-height': parseCSSValue(dimensions.height),
      '--padd-spacer-width': parseCSSValue(dimensions.width),
      '--padd-base-unit': baseUnit,
      '--padd-z-index': zIndex,
    } as const

    // Only override the color if customColor is provided
    if (customColor) {
      return cs({
        ...baseStyles,
        '--padd-spacer-color': customColor,
      } as CSSCustomProperties, style)
    }

    return cs(baseStyles as CSSCustomProperties, style)
  }, [dimensions, baseUnit, zIndex, customColor, style])


  return (
    <div
      className={cx(styles.spacer, className)}
      data-testid="spacer-container"
      data-variant={variant}
      style={combinedStyles}
    >
      {measurements}
    </div>
  )
})
