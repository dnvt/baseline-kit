import { memo, useMemo, Fragment, CSSProperties } from 'react'
import { THEME, useComponentConfig } from '@context'
import { useSpacerDimensions } from '@hooks'
import { cs, cx } from '@utils'

import { SpacerProps } from './types'
import styles from './styles.module.css'

/**
 * Spacer Component
 * A flexible spacer element that adjusts its dimensions based on provided height and width.
 * Optionally displays measurement indicators.
 *
 * @param height - The height of the spacer.
 * @param width - The width of the spacer.
 * @param config - Configuration object for the spacer.
 * @param indicatorNode - A function to render measurement indicators.
 * @param visibility - Visibility of the spacer ('visible' or 'hidden').
 * @param className - Additional class names for the container.
 * @param style - Additional inline styles for the container.
 */
export const Spacer = memo(function Spacer({
  height,
  width,
  indicatorNode,
  visibility = THEME.visibility.hidden,
  className = '',
  style = {},
}: SpacerProps) {
  const config = useComponentConfig('spacer')
  const {
    baseUnit,
    variant,
    zIndex,
    colors,
  } = config

  const isShown = visibility === 'visible'

  // Calculate dimensions and normalize height/width
  const { dimensions, normalizedHeight, normalizedWidth } = useSpacerDimensions({
    height,
    width,
    baseUnit,
  })

  const measurements = useMemo(() => {
    if (!isShown || !indicatorNode) return null

    const result = []

    if (normalizedHeight !== null) {
      result.push(
        <Fragment key="height">
          {indicatorNode(normalizedHeight, 'height')}
        </Fragment>,
      )
    }

    if (normalizedWidth !== null) {
      result.push(
        <Fragment key="width">
          {indicatorNode(normalizedWidth, 'width')}
        </Fragment>,
      )
    }

    return result
  }, [isShown, indicatorNode, normalizedHeight, normalizedWidth])

  const combinedStyles = useMemo(() => {
    const baseStyles = {
      '--spc-height': dimensions.height,
      '--spc-width': dimensions.width,
      '--spc-base-unit': baseUnit,
      '--spc-z-index': zIndex,
      '--spc-color': colors[variant as keyof typeof colors],
    } as CSSProperties

    return cs(baseStyles, style)
  }, [dimensions, baseUnit, zIndex, colors, variant, style])

  return (
    <div
      className={cx(
        styles.spacer,
        className,
        isShown ? styles.visible : styles.hidden,
      )}
      data-testid="spacer-container"
      data-variant={variant}
      style={combinedStyles}
    >
      {measurements}
    </div>
  )
})
