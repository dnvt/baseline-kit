import * as React from 'react'
import { useConfig, useDebug, useBaseline } from '../../hooks'
import { cx, parsePadding, createPadderDescriptor } from '@baseline-kit/core'
import { hydratedValue } from '@baseline-kit/dom'
import { mergeStyles, mergeRefs } from '../../utils/merge'
import { ComponentsProps, Variant } from '../types'
import { Spacer, IndicatorNode } from '../Spacer'
import type { DebuggingMode } from '../types'
import styles from './styles.module.css'

export type PadderProps = {
  indicatorNode?: IndicatorNode
  ssrMode?: boolean
  children?: React.ReactNode
} & ComponentsProps

const createRenderSpacerFn = (
  variant: Variant | undefined,
  debugging: DebuggingMode | undefined,
  indicatorNode?: IndicatorNode
) => {
  const safeVariant = variant || 'line'
  const safeDebugging = debugging || 'none'

  const SpacerElement = (
    widthVal: React.CSSProperties['width'],
    heightVal: React.CSSProperties['height']
  ) => (
    <Spacer
      variant={safeVariant}
      debugging={heightVal === 0 || widthVal === 0 ? 'none' : safeDebugging}
      indicatorNode={indicatorNode}
      height={heightVal !== '100%' ? heightVal : undefined}
      width={widthVal !== '100%' ? widthVal : undefined}
    />
  )
  SpacerElement.displayName = 'PadderSpacer'
  return SpacerElement
}

// Static grid position styles — hoisted to avoid re-creation on render
const GRID_FULL_ROW: React.CSSProperties = { gridColumn: '1 / -1' }
const GRID_MID_COL: React.CSSProperties = { gridRow: '2 / 3' }
const GRID_CENTER: React.CSSProperties = {
  gridRow: '2 / 3',
  gridColumn: '2 / 3',
}

export const Padder = React.memo(
  React.forwardRef<HTMLDivElement, PadderProps>(function Padder(
    {
      children,
      className,
      debugging: debuggingProp,
      height,
      indicatorNode,
      style,
      width,
      ssrMode = false,
      ...spacingProps
    },
    ref
  ) {
    const config = useConfig('padder')
    const { variant } = useConfig('spacer')
    const initialPadding = React.useMemo(
      () => parsePadding(spacingProps),
      [spacingProps]
    )
    const { isShown, isNone, debugging } = useDebug(
      debuggingProp,
      config.debugging
    )
    const enableSpacers = !isNone

    const [isHydrated, setIsHydrated] = React.useState(false)
    React.useEffect(() => {
      setIsHydrated(true)
    }, [])

    const internalRef = React.useRef<HTMLDivElement | null>(null)

    const baselinePadding = useBaseline(internalRef, {
      base: config.base,
      snapping: 'height',
      spacing: initialPadding,
      warnOnMisalignment: !isNone,
    })

    const stablePadding = {
      padding: {
        top: initialPadding.top || 0,
        right: initialPadding.right || 0,
        bottom: initialPadding.bottom || 0,
        left: initialPadding.left || 0,
      },
    }
    const { padding } = hydratedValue(
      isHydrated && !ssrMode,
      stablePadding,
      baselinePadding
    )

    const setRefs = mergeRefs(ref, internalRef)

    const descriptor = React.useMemo(
      () =>
        createPadderDescriptor({
          base: config.base,
          color: config.color,
          width: width as number | string | undefined,
          height: height as number | string | undefined,
          padding,
          enableSpacers,
          isVisible: isShown,
        }),
      [
        config.base,
        config.color,
        width,
        height,
        padding,
        enableSpacers,
        isShown,
      ]
    )

    const containerStyles = React.useMemo(
      () => mergeStyles(descriptor.containerStyle, style),
      [descriptor.containerStyle, style]
    )

    const renderSpacer = React.useMemo(
      () => createRenderSpacerFn(variant, debugging, indicatorNode),
      [variant, debugging, indicatorNode]
    )

    if (!enableSpacers) {
      return (
        <div
          ref={setRefs}
          data-testid="padder"
          className={cx(
            ...descriptor.classTokens.map((t) => styles[t]),
            className
          )}
          style={containerStyles}
        >
          {children}
        </div>
      )
    }

    return (
      <div
        ref={setRefs}
        data-testid="padder"
        className={cx(
          ...descriptor.classTokens.map((t) => styles[t]),
          className
        )}
        style={containerStyles}
      >
        <>
          {padding.top >= 0 && (
            <div style={GRID_FULL_ROW}>{renderSpacer('100%', padding.top)}</div>
          )}
          {padding.left >= 0 && (
            <div style={GRID_MID_COL}>{renderSpacer(padding.left, '100%')}</div>
          )}
        </>
        <div style={GRID_CENTER}>{children}</div>
        <>
          {padding.right >= 0 && (
            <div style={GRID_MID_COL}>
              {renderSpacer(padding.right, '100%')}
            </div>
          )}
          {padding.bottom >= 0 && (
            <div style={GRID_FULL_ROW}>
              {renderSpacer('100%', padding.bottom)}
            </div>
          )}
        </>
      </div>
    )
  })
)
