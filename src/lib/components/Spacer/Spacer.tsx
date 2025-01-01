import { memo, useMemo } from 'react'
import { SPACER } from '@config'
import { useSpacerDimensions } from '@hooks'
import { CSSCustomProperties } from '@types'
import { cs, cx, parseCSSValue } from '@utils'

import { SpacerProps } from './types'
import styles from './styles.module.css'

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

  const { dimensions, normalizedHeight, normalizedWidth } = useSpacerDimensions({
    height,
    width,
    baseUnit,
    config,
  })

  const measurements = useMemo(() => {
    if (!isShown || !indicatorNode) return null

    const result = []

    if (normalizedHeight !== null) {
      result.push(indicatorNode(normalizedHeight, 'height'))
    }

    if (normalizedWidth !== null) {
      result.push(indicatorNode(normalizedWidth, 'width'))
    }

    return result
  }, [isShown, indicatorNode, normalizedHeight, normalizedWidth])

  const combinedStyles = useMemo(() => {
    const baseStyles = {
      '--padd-spacer-height': parseCSSValue(dimensions.height),
      '--padd-spacer-width': parseCSSValue(dimensions.width),
      '--padd-base-unit': baseUnit,
      '--padd-z-index': zIndex,
    } as const

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
