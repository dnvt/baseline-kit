import { memo, useMemo } from 'react'

import { CSSCustomProperties } from '@types'
import { cs, cx, parseCSSValue } from '@utils'

import { SpacerProps } from './types'
import styles from './styles.module.css'

export const Spacer = memo(function Spacer({
  visibility = 'hidden',
  config,
  height = '100%',
  width = '100%',
  className = '',
  style = {},
}: SpacerProps) {
//  const {
//    baseUnit = GRID.defaults.baseUnit,
//    variant = 'line',
//    measurements = 'none',
//  } = config

  const combinedStyles = useMemo(() =>
    cs({
      '--spacer-height': parseCSSValue(height),
      '--spacer-width': parseCSSValue(width),
    } as CSSCustomProperties, style),
  [height, width, style])

  return (
    <div
      className={cx(
        styles.spacer,
        (visibility === 'visible') && styles.guides,
        className,
      )}
      style={combinedStyles}
    />
  )
})