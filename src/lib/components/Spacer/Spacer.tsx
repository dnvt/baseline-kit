import { memo, useMemo, Fragment, CSSProperties, ReactNode } from 'react'
import { useSpacerDimensions } from '@hooks'
import { ComponentsProps } from '@types'
import { cs, CSSValue, cx } from '@utils'
import styles from './styles.module.css'
import { useConfig, Visibility } from '../Config'

export type SpacerVariant = 'line' | 'flat'
export type SpacerDimension = 'width' | 'height'
export type SpacerDimensions = Record<SpacerDimension, CSSValue | '100%'>

// For measurement indicators
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
  visibility: visibilityProp,
  variant: variantProp,
  className,
  style,
  ...props
}: SpacerProps) {
  const config = useConfig('spacer')

  const isShown = (visibilityProp ?? config.visibility) === 'visible'
  const variant = variantProp ?? config.variant

  // Calculate dimensions based on provided values or theme defaults
  const { dimensions, normalizedHeight, normalizedWidth } = useSpacerDimensions({
    height,
    width,
    base: config.base,
  })

  // Generate measurement indicators when visible
  const measurements = useMemo(() => {
    if (!isShown || !indicatorNode) return null

    const indicators = []

    if (normalizedHeight !== null) {
      indicators.push(
        <Fragment key="height">
          {indicatorNode(normalizedHeight, 'height')}
        </Fragment>,
      )
    }

    if (normalizedWidth !== null) {
      indicators.push(
        <Fragment key="width">
          {indicatorNode(normalizedWidth, 'width')}
        </Fragment>,
      )
    }

    return indicators
  }, [isShown, indicatorNode, normalizedHeight, normalizedWidth])

  // Combine base styles with theme values and custom styles
  const containerStyles = useMemo(() => cs({
    '--spc-height': dimensions.height,
    '--spc-width': dimensions.width,
    '--spc-base': `${config.base}px`,
    '--spc-color': variant === 'line'
      ? config.colors.line
      : config.colors.flat,
    '--spc-indicator-color': config.colors.indice,
  } as CSSProperties, style), [
    dimensions,
    config,
    variant,
    style,
  ])

  return (
    <div
      className={cx(
        styles.spacer,
        config.variant === 'line' && styles.line,
        config.variant === 'flat' && styles.flat,
        isShown ? styles.visible : styles.hidden,
        className,
      )}
      data-testid="spacer"
      data-variant={config.variant}
      style={containerStyles}
      {...props}
    >
      {measurements}
    </div>
  )
})