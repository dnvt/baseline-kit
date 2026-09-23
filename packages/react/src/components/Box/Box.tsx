import * as React from 'react'
import { useConfig, useDebug, useBaseline, useIsClient } from '../../hooks'
import {
  DEFAULT_CONFIG,
  cx,
  parsePadding,
  createBoxDescriptor,
  requiresSeparatePadder,
} from '@baseline-kit/core'
import type { SnapEdge, SnappingMode } from '@baseline-kit/core'
import { hydratedValue } from '@baseline-kit/dom'
import { mergeStyles, mergeRefs } from '../../utils/merge'
import { getDOMAttributes } from '../../utils/dom'
import { compactStyle } from '../../utils/dom'
import { Config } from '../Config/Config'
import { Padder } from '../Padder'
import padderStyles from '../Padder/styles.module.css'
import { ComponentsProps } from '../types'
import styles from './styles.module.css'

export type { SnapEdge, SnappingMode }

export type BoxProps = {
  colSpan?: number
  rowSpan?: number
  span?: number
  snapping?: SnappingMode
  snapEdge?: SnapEdge
  ssrMode?: boolean
  children?: React.ReactNode
} & ComponentsProps

export const Box = React.memo(
  React.forwardRef<HTMLDivElement, BoxProps>(function Box(
    {
      children,
      snapping = 'clamp',
      snapEdge = 'bottom',
      debugging: debuggingProp,
      className,
      colSpan,
      rowSpan,
      span,
      width,
      height,
      style,
      ssrMode = false,
      ...spacingProps
    },
    ref
  ) {
    const config = useConfig('box')
    const padderConfig = useConfig('padder')
    const { isShown, debugging } = useDebug(debuggingProp, config.debugging)

    const isHydrated = useIsClient()
    const internalRef = React.useRef<HTMLDivElement | null>(null)
    const { top, bottom, left, right } = parsePadding(spacingProps)

    const baselinePadding = useBaseline(internalRef, {
      base: config.base,
      snapping,
      snapEdge,
      spacing: { top, bottom, left, right },
    })

    const stablePadding = {
      padding: {
        top: top || 0,
        right: right || 0,
        bottom: bottom || 0,
        left: left || 0,
      },
    }
    const { padding } = hydratedValue(
      isHydrated && !ssrMode,
      stablePadding,
      baselinePadding
    )

    const descriptor = React.useMemo(
      () =>
        createBoxDescriptor({
          base: config.base,
          lineColor: config.colors.line,
          width,
          height,
          span,
          colSpan,
          rowSpan,
          isVisible: isShown,
        }),
      [
        config.base,
        config.colors.line,
        width,
        height,
        span,
        colSpan,
        rowSpan,
        isShown,
      ]
    )

    const separatePadder = requiresSeparatePadder({
      className,
      style,
      width,
      debugging,
    })

    const boxStyles = React.useMemo(
      () =>
        mergeStyles(
          compactStyle(descriptor.boxStyle, {
            '--bkbx-w': 'fit-content',
            '--bkbx-h': 'fit-content',
            '--bkbx-cl': DEFAULT_CONFIG.box.colors.line,
          }),
          separatePadder
            ? isShown && debugging !== 'none'
              ? compactStyle(
                  { '--bkpd-c': padderConfig.color },
                  { '--bkpd-c': DEFAULT_CONFIG.padder.color }
                )
              : undefined
            : compactStyle(
                {
                  ...(padding.top > 0 || padding.bottom > 0
                    ? {
                        gridTemplateRows: `${padding.top}px 1fr ${padding.bottom}px`,
                      }
                    : {}),
                  ...(padding.left > 0 || padding.right > 0
                    ? {
                        gridTemplateColumns: `${padding.left}px 1fr ${padding.right}px`,
                      }
                    : {}),
                },
                {
                  gridTemplateRows: 'auto 1fr auto',
                  gridTemplateColumns: 'auto 1fr auto',
                }
              ),
          style
        ),
      [
        descriptor.boxStyle,
        separatePadder,
        style,
        padderConfig.color,
        debugging,
        isShown,
        padding.top,
        padding.right,
        padding.bottom,
        padding.left,
      ]
    )

    return (
      <div
        ref={mergeRefs(ref, internalRef)}
        data-testid={config.domDiagnostics ? 'box' : undefined}
        className={cx(
          ...descriptor.classTokens.map((t) => styles[t]),
          separatePadder && styles.separatePadder,
          isShown && debugging !== 'none' && styles.padderVisible,
          className
        )}
        style={mergeStyles(boxStyles, descriptor.gridSpanStyle)}
        {...getDOMAttributes(spacingProps)}
      >
        <Config base={1} spacer={{ variant: 'flat' }}>
          {separatePadder ? (
            <Padder
              block={[padding.top, padding.bottom]}
              inline={[padding.left, padding.right]}
              width="fit-content"
              height={height}
              debugging={debugging}
              ssrMode
            >
              {children}
            </Padder>
          ) : (
            <div
              data-testid={config.domDiagnostics ? 'padder-content' : undefined}
              className={padderStyles.content}
            >
              {children}
            </div>
          )}
        </Config>
      </div>
    )
  })
)
