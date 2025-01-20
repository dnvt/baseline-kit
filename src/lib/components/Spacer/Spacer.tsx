import { memo, useMemo, CSSProperties, ReactNode } from 'react'
import { useConfig, useSpacerDimensions, useVisibility } from '@hooks'
import { CSSValue, cs, cx } from '@utils'
import { Visibility } from '../Config'
import { ComponentsProps } from '../types'
import styles from './styles.module.css'

export type SpacerVariant = 'line' | 'flat'
export type SpacerDimension = 'width' | 'height'
export type SpacerDimensions = {
  width: CSSValue | '100%'
  height: CSSValue | '100%'
}

export type IndicatorNode = (value: number, dimension: SpacerDimension) => ReactNode
export type SpacerProps = ComponentsProps & {
  /** Height of the spacer */
  height?: CSSValue
  /** Width of the spacer */
  width?: CSSValue
  /** Optional node for displaying measurements */
  indicatorNode?: IndicatorNode
  /** Override variant from theme */
  variant?: SpacerVariant
  /** Override visibility from theme */
  visibility?: Visibility
}

/**
 * Spacer Component
 * A flexible spacer element that adjusts its dimensions based on provided height and width.
 * Integrates with theme context for consistent styling and behavior.
 */
export const Spacer = memo(function Spacer({
  height,
  width,
  indicatorNode,
  visibility,
  variant: variantProp,
  className,
  style,
  ...props
}: SpacerProps) {
  const config = useConfig('spacer')
  const { isShown } = useVisibility(visibility, config.visibility)
  const variant = variantProp ?? config.variant

  const { dimensions, normalizedHeight, normalizedWidth } = useSpacerDimensions({
    height,
    width,
    base: config.base,
  })

  const measurements = useMemo(() => {
    if (!isShown || !indicatorNode) return null

    return [
      normalizedHeight !== null && (
        <span key="height">
          {indicatorNode(normalizedHeight, 'height')}
        </span>
      ),
      normalizedWidth !== null && (
        <span key="width">
          {indicatorNode(normalizedWidth, 'width')}
        </span>
      ),
    ].filter(Boolean)
  }, [isShown, indicatorNode, normalizedHeight, normalizedWidth])

  const containerStyles = useMemo(() => cs({
    '--pdd-spacer-height': dimensions.height,
    '--pdd-spacer-width': dimensions.width,
    '--pdd-spacer-base': `${config.base}px`,
    '--pdd-spacer-color': variant === 'line' ? config.colors.line : config.colors.flat,
    '--pdd-spacer-indicator-color': config.colors.indice,
  } as CSSProperties, style), [
    dimensions,
    config.base,
    config.colors,
    variant,
    style,
  ])

  return (
    <div
      className={cx(
        styles.spacer,
        styles[variant],
        isShown ? styles.visible : styles.hidden,
        className,
      )}
      data-testid="spacer"
      data-variant={variant}
      style={containerStyles}
      {...props}
    >
      {measurements}
    </div>
  )
})
