import * as React from 'react'
import { useConfig, useDebug, useBaseline } from '../../hooks'
import { cx, parsePadding, createBoxDescriptor } from '@baseline-kit/core'
import type { SnappingMode } from '@baseline-kit/core'
import { hydratedValue } from '@baseline-kit/dom'
import { mergeStyles, mergeRefs } from '../../utils/merge'
import { Config } from '../Config/Config'
import { Padder } from '../Padder'
import { ComponentsProps } from '../types'
import styles from './styles.module.css'

export type { SnappingMode }

export type BoxProps = {
  colSpan?: number
  rowSpan?: number
  span?: number
  snapping?: SnappingMode
  ssrMode?: boolean
  children?: React.ReactNode
} & ComponentsProps

export const Box = React.memo(
  React.forwardRef<HTMLDivElement, BoxProps>(function Box(
    { children, snapping = 'clamp', debugging: debuggingProp, className, colSpan, rowSpan, span, width, height, style, ssrMode = false, ...spacingProps },
    ref
  ) {
    const config = useConfig('box')
    const { isShown, debugging } = useDebug(debuggingProp, config.debugging)

    const [isHydrated, setIsHydrated] = React.useState(false)
    React.useEffect(() => { setIsHydrated(true) }, [])

    const internalRef = React.useRef<HTMLDivElement | null>(null)
    const { top, bottom, left, right } = parsePadding(spacingProps)

    const baselinePadding = useBaseline(internalRef, {
      base: config.base,
      snapping,
      spacing: { top, bottom, left, right },
      warnOnMisalignment: debugging !== 'none',
    })

    const stablePadding = { padding: { top: top || 0, right: right || 0, bottom: bottom || 0, left: left || 0 } }
    const { padding } = hydratedValue(isHydrated && !ssrMode, stablePadding, baselinePadding)

    const descriptor = React.useMemo(
      () => createBoxDescriptor({ base: config.base, lineColor: config.colors.line, width, height, span, colSpan, rowSpan, isVisible: isShown }),
      [config.base, config.colors.line, width, height, span, colSpan, rowSpan, isShown]
    )

    const boxStyles = React.useMemo(
      () => mergeStyles(descriptor.boxStyle as React.CSSProperties, style),
      [descriptor.boxStyle, style]
    )

    return (
      <div
        ref={mergeRefs(ref, internalRef)}
        data-testid="box"
        className={cx(...descriptor.classTokens.map(t => styles[t]), className)}
        style={mergeStyles(boxStyles, descriptor.gridSpanStyle)}
      >
        <Config base={1} spacer={{ variant: 'flat' }}>
          <Padder
            block={[padding.top, padding.bottom]}
            inline={[padding.left, padding.right]}
            width="fit-content"
            height={height}
            debugging={debugging}
            ssrMode={ssrMode}
          >
            {children}
          </Padder>
        </Config>
      </div>
    )
  })
)
