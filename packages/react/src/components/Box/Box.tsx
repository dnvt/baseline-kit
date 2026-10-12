import * as React from 'react'
import { useConfig, useDebug, useBaseline, useIsClient } from '../../hooks'
import {
  cx,
  parsePadding,
  createBoxDescriptor,
  requiresSeparatePadder,
  getDOMAttributes,
} from '@baseline-kit/core'
import type {
  BoxElement,
  BoxOptions,
  SnapEdge,
  SnappingMode,
} from '@baseline-kit/core'
import { hydratedValue } from '@baseline-kit/dom'
import { mergeStyles, mergeRefs } from '../../utils/merge'
import { Config } from '../Config/Config'
import { PadderForBox } from '../Padder/Padder'
import type { HostProps } from '../types'

export type { BoxElement, SnapEdge, SnappingMode }

export type BoxProps = BoxOptions &
  HostProps & {
    children?: React.ReactNode
  }

export const Box = React.memo(
  React.forwardRef<HTMLElement, BoxProps>(function Box(
    {
      as,
      htmlFor,
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
    const internalRef = React.useRef<HTMLElement | null>(null)
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

    const descriptor = createBoxDescriptor({
      base: config.base,
      lineColor: config.colors.line,
      flatColor: config.colors.flat,
      width,
      height,
      span,
      colSpan,
      rowSpan,
      isVisible: isShown,
      padding,
      paddingColor: padderConfig.color,
    })

    // A semantic host keeps caller layout on the host and snaps an inner grid.
    const semanticHost = as !== undefined
    const Element = as ?? 'div'
    const ContentElement = semanticHost && as !== 'div' ? 'span' : 'div'
    const separatePadder =
      !semanticHost && requiresSeparatePadder({ className, style, width })
    const hostSpacingStyle = semanticHost
      ? descriptor.paddingDebugStyle
      : separatePadder
        ? undefined
        : mergeStyles(descriptor.spacingStyle, descriptor.paddingDebugStyle)

    const content = (
      <ContentElement
        data-testid={config.domDiagnostics ? 'padder-content' : undefined}
        className="bk-pad-content"
      >
        {children}
      </ContentElement>
    )

    return (
      <Element
        ref={mergeRefs(ref, internalRef)}
        data-testid={config.domDiagnostics ? 'box' : undefined}
        className={cx(
          ...descriptor.classTokens.map((t) => `bk-${t}`),
          semanticHost && 'bk-box-semantic-host',
          separatePadder && 'bk-box-separate-padder',
          isShown && !separatePadder && 'bk-box-pad-visible',
          className
        )}
        style={mergeStyles(
          descriptor.boxStyle,
          hostSpacingStyle,
          descriptor.gridSpanStyle,
          style
        )}
        htmlFor={as === 'label' ? htmlFor : undefined}
        {...getDOMAttributes(spacingProps)}
      >
        {/* Box spacing is drawn in plain pixels, so content inside a Box
            snaps to whole pixels rather than to the grid. */}
        <Config base={1} spacer={{ variant: 'flat' }}>
          {semanticHost ? (
            <ContentElement
              className="bk-box__grid"
              style={descriptor.spacingStyle}
            >
              {content}
            </ContentElement>
          ) : separatePadder ? (
            <PadderForBox
              block={[padding.top, padding.bottom]}
              inline={[padding.left, padding.right]}
              width="fit-content"
              height={height}
              debugging={debugging}
              preserveContentHost
              ssrMode
            >
              {children}
            </PadderForBox>
          ) : (
            content
          )}
        </Config>
      </Element>
    )
  })
)
