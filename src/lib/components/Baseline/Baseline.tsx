import { CSSProperties, memo, useMemo, useRef } from 'react'
import { ComponentsProps } from '@components'
import { useConfig, useGuideDimensions, useNormalizedDimensions, useVisibility } from '@hooks'
import { BlockInlineSpacing, convertToPixels, CSSValue, normalizeSpacing, PaddingSpacing } from '@utils'
import styles from './styles.module.css'

export type BaselineVariant = 'line' | 'flat'
export type BaselineProps = Omit<ComponentsProps, 'children'> &
  (BlockInlineSpacing | PaddingSpacing) & {
  /** Container height can be a number (e.g. 300) or string (e.g. "50vh"), defaults to full overlay (`'100%'` or container height). */
  height?: CSSValue
  /** Optional container width if you want to fix the baseline container's width */
  width?: CSSValue
  /** Variation: 'line' => 1px lines, 'flat' => base px thick lines */
  variant?: BaselineVariant
}

/**
 * Baseline Component
 * Overlays horizontal lines from top to bottom.
 * - If variant='line', each row is 1px thick
 * - If variant='flat', each row is `base` px thick
 * - By default is absolutely positioned (via CSS) so it won't push the layout
 */
export const Baseline = memo(function Baseline({
  className,
  style,
  variant: variantProp,
  height,
  width,
  ...props
}: BaselineProps) {
  const config = useConfig('baseline')
  const variant = variantProp ?? config.variant
  const { isShown } = useVisibility(props.visibility, config.visibility)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const { width: containerWidth, height: containerHeight } = useGuideDimensions(containerRef)

  const resolvedHeight = useMemo(() => {
    if (height !== undefined) {
      if (typeof height === 'number') {
        return height
      }
      const px = convertToPixels(height)
      return px ?? containerHeight
    }
    return containerHeight
  }, [height, containerHeight])

  const spacing = useMemo(() => normalizeSpacing(props, config.base), [props, config.base])

  // rowCount => (resolvedHeight - topSpacing - bottomSpacing) / base
  const rowCount = useMemo(() => {
    const totalHeight = (resolvedHeight ?? 0) - (spacing.block[0] + spacing.block[1])
    return Math.max(1, Math.ceil(totalHeight / config.base))
  }, [resolvedHeight, spacing.block, config.base])

  const { width: cssWidth } = useNormalizedDimensions({
    width,
    height,
    defaultWidth: containerWidth,
    defaultHeight: containerHeight,
    base: config.base,
  })

  const chosenColor = variant === 'line'
    ? config.colors.line
    : config.colors.flat

  const containerStyles = useMemo(() => ({
    '--pdd-baseline-width': cssWidth,
    paddingBlock: `${spacing.block[0]}px ${spacing.block[1]}px`,
    paddingInline: `${spacing.inline[0]}px ${spacing.inline[1]}px`,
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    height: resolvedHeight ? `${resolvedHeight}px` : 'auto',
    ...style,
  } as CSSProperties), [cssWidth, spacing, resolvedHeight, style],
  )

  return (
    <div
      ref={containerRef}
      data-testid="baseline"
      className={[
        styles.baseline,
        isShown ? styles.visible : styles.hidden,
        className,
      ].filter(Boolean).join(' ')}
      style={containerStyles}
      {...props}
    >
      {isShown && Array.from({ length: rowCount }).map((_, i) => {
        const rowStyle: CSSProperties = {
          top: `${i * config.base}px`,
          left: 0,
          right: 0,
          height: variant === 'line' ? '1px' : `${config.base}px`,
          backgroundColor: chosenColor,
          position: 'absolute',
        }
        return (
          <div
            key={i}
            data-row-index={i}
            style={rowStyle}
          />
        )
      })}
    </div>
  )
})