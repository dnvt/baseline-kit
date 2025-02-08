import * as React from 'react'
import { IndicatorNode } from '@components'
import { useConfig, useDebug, useBaseline } from '@hooks'
import { mergeClasses, mergeStyles, parsePadding } from '@utils'
import { Padder } from '../Padder'
import { Config } from '../Config'
import { ComponentsProps, Variant } from '../types'
import styles from './styles.module.css'

export type StackProps = {
  /** Flex direction: 'row' (default) or 'column'. */
  direction?: 'row' | 'column'
  /** Justify content, e.g. 'flex-start', 'center', 'space-between'. */
  justify?: React.CSSProperties['justifyContent']
  /** Gap between children elements */
  gap?: React.CSSProperties['gap']
  /** Align items, e.g. 'flex-start', 'center', 'stretch'. */
  align?: React.CSSProperties['alignItems']
  /** Optionally, force a fixed width for the container. Defaults to "fit-content" when not provided */
  width?: React.CSSProperties['width']
  /** Optionally, force a fixed height for the container. Defaults to "fit-content" when not provided */
  height?: React.CSSProperties['height']
  /** Function that renders a custom indicator (e.g., a label) showing the spacer's measured dimensions */
  indicatorNode?: IndicatorNode
  /** Controls the visual style of the spacer */
  variant?: Variant
  children?: React.ReactNode
} & ComponentsProps

export const Stack = React.memo(function Stack({
  align = 'stretch',
  children,
  className,
  debugging: debuggingProp,
  direction = 'row',
  gap,
  height,
  indicatorNode,
  justify = 'flex-start',
  variant,
  style,
  width,
  ...spacingProps
}: StackProps) {
  const config = useConfig('flex')
  const { isShown, debugging } = useDebug(debuggingProp, config.debugging)
  const stackRef = React.useRef<HTMLDivElement | null>(null)

  const initialPadding = React.useMemo(() => parsePadding(spacingProps), [spacingProps])
  const { padding } = useBaseline(stackRef, {
    base: config.base,
    snapping: 'height',
    spacing: initialPadding,
    warnOnMisalignment: true,
  })

  const stackGapStyles = React.useMemo(() => {
    const gapStyles: React.CSSProperties = {}
    if (gap !== undefined) {
      gapStyles.gap = gap
    }
    return gapStyles
  }, [gap])

  const containerStyles = React.useMemo(() => {
    return mergeStyles({
      display: 'flex',
      flexDirection: direction,
      justifyContent: justify,
      alignItems: align,
      width: width || 'fit-content',
      height: height || 'fit-content',
      '--bk-stack-color-line': config.colors.line,
      '--bk-stack-color-flat': config.colors.flat,
      '--bk-stack-color-indice': config.colors.indice,
    } as React.CSSProperties,
    stackGapStyles,
    style,
    )
  }, [direction, justify, align, width, height, config.colors.line, config.colors.flat, config.colors.indice, stackGapStyles, style])

  const mergedContainerStyles =
    debugging === 'none'
      ? {
        ...containerStyles,
        paddingBlock: `${padding.top}px ${padding.bottom}px`,
        paddingInline: `${padding.left}px ${padding.right}px`,
      }
      : containerStyles

  return (
    <Config spacer={{ variant }}>
      <Padder
        ref={stackRef}
        data-testid="padder"
        block={[padding.top, padding.bottom]}
        inline={[padding.left, padding.right]}
        debugging={debugging}
        indicatorNode={indicatorNode}
        width={width}
        height={height}
      >
        <div
          data-testid="stack"
          className={mergeClasses(
            className,
            styles.stack,
            isShown && styles.visible,
          )}
          style={mergedContainerStyles}
          {...spacingProps}
        >
          {children}
        </div>
      </Padder>
    </Config>
  )
})
