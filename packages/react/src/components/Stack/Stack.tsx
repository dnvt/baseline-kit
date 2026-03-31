import * as React from 'react'
import type { Gaps } from '../types'
import { useConfig, useDebug, useBaseline } from '../../hooks'
import { mergeClasses, parsePadding, createStackDescriptor } from '@baseline-kit/core'
import { hydratedValue } from '@baseline-kit/dom'
import { mergeStyles } from '../../utils/merge'
import { Padder } from '../Padder'
import { IndicatorNode } from '../Spacer'
import { Config } from '../Config'
import { ComponentsProps, Variant } from '../types'
import styles from './styles.module.css'

export type CSSPropertiesDirectionalAxis = 'x' | 'y' | '-x' | '-y'

export type StackProps = {
  direction?: React.CSSProperties['flexDirection'] | CSSPropertiesDirectionalAxis
  justify?: React.CSSProperties['justifyContent']
  align?: React.CSSProperties['alignItems']
  width?: React.CSSProperties['width']
  height?: React.CSSProperties['height']
  indicatorNode?: IndicatorNode
  variant?: Variant
  gap?: Gaps
  rowGap?: Gaps
  columnGap?: Gaps
  ssrMode?: boolean
  children?: React.ReactNode
} & ComponentsProps

export const Stack = React.memo(function Stack({
  align = 'flex-start',
  children,
  className,
  columnGap,
  debugging: debuggingProp,
  direction = 'row',
  gap,
  height,
  indicatorNode,
  justify = 'flex-start',
  rowGap,
  style,
  variant,
  width,
  ssrMode = false,
  ...spacingProps
}: StackProps) {
  const config = useConfig('stack')
  const { isShown, debugging } = useDebug(debuggingProp, config.debugging)

  const [isHydrated, setIsHydrated] = React.useState(false)
  React.useEffect(() => { setIsHydrated(true) }, [])

  const stackRef = React.useRef<HTMLDivElement | null>(null)
  const { top, right, bottom, left } = parsePadding({ ...spacingProps })

  const baselinePadding = useBaseline(stackRef, {
    base: config.base,
    snapping: 'height',
    spacing: { top, right, bottom, left },
    warnOnMisalignment: debugging !== 'none',
  })

  const stablePadding = { padding: { top: top || 0, right: right || 0, bottom: bottom || 0, left: left || 0 } }
  const { padding } = hydratedValue(isHydrated && !ssrMode, stablePadding, baselinePadding)

  const descriptor = React.useMemo(
    () => createStackDescriptor({
      colors: config.colors,
      direction,
      justify,
      align,
      width: width as number | string | undefined,
      height: height as number | string | undefined,
      gap: gap !== undefined ? Number(gap) : undefined,
      rowGap: rowGap !== undefined ? Number(rowGap) : undefined,
      columnGap: columnGap !== undefined ? Number(columnGap) : undefined,
    }),
    [config.colors, direction, justify, align, width, height, gap, rowGap, columnGap]
  )

  const containerStyles = React.useMemo(
    () => mergeStyles(descriptor.containerStyle as React.CSSProperties, style),
    [descriptor.containerStyle, style]
  )

  const mergedContainerStyles = debugging === 'none'
    ? { ...containerStyles, paddingBlock: `${padding.top}px ${padding.bottom}px`, paddingInline: `${padding.left}px ${padding.right}px` }
    : containerStyles

  return (
    <Config spacer={{ variant: variant ?? 'line' }}>
      <Padder
        ref={stackRef}
        block={[padding.top, padding.bottom]}
        inline={[padding.left, padding.right]}
        debugging={debugging}
        indicatorNode={indicatorNode}
        width={width}
        height={height}
        ssrMode={ssrMode}
      >
        <div
          data-testid="stack"
          className={mergeClasses(className, styles.stk, isShown && styles.v)}
          style={mergedContainerStyles}
          {...spacingProps}
        >
          {children}
        </div>
      </Padder>
    </Config>
  )
})
