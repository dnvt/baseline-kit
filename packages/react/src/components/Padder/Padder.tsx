import * as React from 'react'
import { useConfig, useDebug, useBaseline, useIsClient } from '../../hooks'
import {
  DEFAULT_CONFIG,
  cx,
  parsePadding,
  createPadderDescriptor,
} from '@baseline-kit/core'
import { hydratedValue } from '@baseline-kit/dom'
import { mergeStyles, mergeRefs } from '../../utils/merge'
import { getDOMAttributes } from '../../utils/dom'
import { compactStyle } from '../../utils/dom'
import { ComponentsProps, Variant } from '../types'
import { Spacer, IndicatorNode } from '../Spacer'
import type { DebuggingMode } from '../types'
import styles from './styles.module.css'

export type PadderProps = {
  indicatorNode?: IndicatorNode
  ssrMode?: boolean
  children?: React.ReactNode
} & ComponentsProps

type RuntimePadderProps = PadderProps & {
  preserveContentHost?: boolean
}

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

const PadderComponent = React.memo(
  React.forwardRef<HTMLDivElement, RuntimePadderProps>(function Padder(
    {
      children,
      className,
      debugging: debuggingProp,
      height,
      indicatorNode,
      style,
      width,
      ssrMode = false,
      preserveContentHost = false,
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

    const isHydrated = useIsClient()
    const internalRef = React.useRef<HTMLDivElement | null>(null)

    const baselinePadding = useBaseline(internalRef, {
      base: config.base,
      snapping: 'height',
      spacing: initialPadding,
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
      () =>
        mergeStyles(
          compactStyle(descriptor.containerStyle, {
            '--bkpd-w': 'fit-content',
            '--bkpd-h': 'fit-content',
            '--bkpd-b': '8px',
            '--bkpd-c': DEFAULT_CONFIG.padder.color,
          }),
          style
        ),
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
          data-testid={config.domDiagnostics ? 'padder' : undefined}
          className={cx(
            ...descriptor.classTokens.map((t) => styles[t]),
            className
          )}
          style={containerStyles}
          {...getDOMAttributes(spacingProps)}
        >
          {preserveContentHost ? (
            <div
              key="content"
              data-testid={config.domDiagnostics ? 'padder-content' : undefined}
              className={styles.content}
            >
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      )
    }

    return (
      <div
        ref={setRefs}
        data-testid={config.domDiagnostics ? 'padder' : undefined}
        className={cx(
          ...descriptor.classTokens.map((t) => styles[t]),
          className
        )}
        style={containerStyles}
        {...getDOMAttributes(spacingProps)}
      >
        <>
          {padding.top > 0 && (
            <div className={styles.topEdge}>
              {renderSpacer('100%', padding.top)}
            </div>
          )}
          {padding.left > 0 && (
            <div className={styles.leftEdge}>
              {renderSpacer(padding.left, '100%')}
            </div>
          )}
        </>
        <div
          key="content"
          data-testid={config.domDiagnostics ? 'padder-content' : undefined}
          className={styles.content}
        >
          {children}
        </div>
        <>
          {padding.right > 0 && (
            <div className={styles.rightEdge}>
              {renderSpacer(padding.right, '100%')}
            </div>
          )}
          {padding.bottom > 0 && (
            <div className={styles.bottomEdge}>
              {renderSpacer('100%', padding.bottom)}
            </div>
          )}
        </>
      </div>
    )
  })
)

export const Padder = PadderComponent as unknown as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    PadderProps & React.RefAttributes<HTMLDivElement>
  >
>

/** @internal Used by Box to preserve its keyed content host across debug modes. */
export const PadderForBox = PadderComponent
