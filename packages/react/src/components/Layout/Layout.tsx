import * as React from 'react'
import type { Gaps } from '../types'
import { useConfig, useDebug, useBaseline } from '../../hooks'
import { parsePadding, mergeClasses, createLayoutDescriptor } from '@baseline-kit/core'
import { hydratedValue } from '@baseline-kit/dom'
import { mergeStyles } from '../../utils/merge'
import { Config } from '../Config'
import { Padder } from '../Padder'
import { Spacer } from '../Spacer'
import { ComponentsProps, Variant } from '../types'
import styles from './styles.module.css'

type IndicatorNode = NonNullable<React.ComponentProps<typeof Spacer>['indicatorNode']>

export type LayoutProps = {
  columns?: number | string | Array<number | string>
  rows?: number | string | Array<number | string>
  justifyItems?: React.CSSProperties['justifyItems']
  alignItems?: React.CSSProperties['alignItems']
  justifyContent?: React.CSSProperties['justifyContent']
  alignContent?: React.CSSProperties['alignContent']
  indicatorNode?: IndicatorNode
  variant?: Variant
  ssrMode?: boolean
  width?: React.CSSProperties['width']
  height?: React.CSSProperties['height']
  children?: React.ReactNode
} & ComponentsProps & Gaps

export const Layout = React.memo(function Layout({
  alignContent,
  alignItems,
  children,
  className,
  columns = 'repeat(auto-fill, minmax(100px, 1fr))',
  columnGap,
  debugging: debuggingProp,
  gap,
  height,
  indicatorNode,
  justifyContent,
  justifyItems,
  rowGap,
  rows,
  style,
  variant,
  width,
  ssrMode = false,
  ...spacingProps
}: LayoutProps) {
  const config = useConfig('layout')
  const { isShown, debugging } = useDebug(debuggingProp, config.debugging)

  const [isHydrated, setIsHydrated] = React.useState(false)
  React.useEffect(() => { setIsHydrated(true) }, [])

  const layoutRef = React.useRef<HTMLDivElement>(null)
  const initialPadding = React.useMemo(() => parsePadding(spacingProps), [spacingProps])

  const baselinePadding = useBaseline(layoutRef, {
    base: config.base,
    snapping: 'height',
    spacing: initialPadding,
    warnOnMisalignment: true,
  })

  const stablePadding = {
    padding: { top: initialPadding.top || 0, right: initialPadding.right || 0, bottom: initialPadding.bottom || 0, left: initialPadding.left || 0 },
  }
  const { padding } = hydratedValue(isHydrated && !ssrMode, stablePadding, baselinePadding)

  const descriptor = React.useMemo(
    () => createLayoutDescriptor({
      colors: config.colors,
      columns,
      rows,
      width: width as number | string | undefined,
      height: height as number | string | undefined,
      gap: gap as number | string | undefined,
      rowGap: rowGap as number | string | undefined,
      columnGap: columnGap as number | string | undefined,
      justifyItems: justifyItems as string | undefined,
      alignItems: alignItems as string | undefined,
      justifyContent: justifyContent as string | undefined,
      alignContent: alignContent as string | undefined,
    }),
    [config.colors, columns, rows, width, height, gap, rowGap, columnGap, justifyItems, alignItems, justifyContent, alignContent]
  )

  const containerStyles = React.useMemo(
    () => mergeStyles(descriptor.containerStyle as React.CSSProperties, style),
    [descriptor.containerStyle, style]
  )

  return (
    <Config spacer={{ variant: variant ?? 'line' }}>
      <Padder
        ref={layoutRef}
        className={isShown ? styles.v : ''}
        block={[padding.top, padding.bottom]}
        {...(indicatorNode ? { indicatorNode } : {})}
        inline={[padding.left, padding.right]}
        debugging={debugging}
        width={width}
        height={height}
        ssrMode={ssrMode}
      >
        <div
          data-testid="layout"
          className={mergeClasses(className, styles.lay)}
          style={containerStyles}
          {...(spacingProps && Object.keys(spacingProps).length > 0
            ? Object.fromEntries(Object.entries(spacingProps).filter(([key]) => key !== 'ssrMode'))
            : {})}
        >
          {children}
        </div>
      </Padder>
    </Config>
  )
})
