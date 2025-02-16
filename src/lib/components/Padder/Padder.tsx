/**
 * @file Padder Component
 * @description Low-level padding management with visual debugging
 * @module components
 */

import * as React from 'react'
import { useConfig, useDebug, useBaseline } from '@hooks'
import { mergeClasses, mergeStyles, parsePadding, mergeRefs } from '@utils'
import { ComponentsProps } from '../types'
import { IndicatorNode, Spacer } from '../Spacer'
import styles from './styles.module.css'

type RenderSpacerFn = (width: React.CSSProperties['width'], height: React.CSSProperties['height']) => React.ReactNode

type PadderProps = {
  /** Render function for custom measurement indicators */
  indicatorNode?: IndicatorNode;
  children?: React.ReactNode;
} & ComponentsProps

/**
 * A foundational component that manages consistent padding with visual debugging.
 *
 * @remarks
 * Padder is a low-level utility that:
 * - Applies consistent padding around content
 * - Supports visual debugging of spacing
 * - Maintains baseline grid alignment
 * - Uses Spacer components for visual padding representation
 *
 * When debugging is enabled (`"visible"` or `"hidden"`), padding is represented
 * using Spacer components. When debugging is `"none"`, direct CSS padding is
 * applied for better performance.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Padder block={16} inline={8}>
 *   <div>Content with consistent padding</div>
 * </Padder>
 *
 * // With debug visuals and custom indicators
 * <Padder
 *   block={[8, 16]}
 *   inline={[16, 24]}
 *   debugging="visible"
 *   indicatorNode={(value, dim) => (
 *     <span className="text-sm">{dim}: {value}px</span>
 *   )}
 * >
 *   <div>Content with visible padding guides</div>
 * </Padder>
 *
 * // Direct padding mode
 * <Padder
 *   block={16}
 *   inline={24}
 *   debugging="none"
 * >
 *   <div>Content with direct CSS padding</div>
 * </Padder>
 * ```
 */
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
      ...spacingProps
    },
    ref,
  ) {
    const config = useConfig('padder')
    const { variant } = useConfig('spacer')
    const initialPadding = React.useMemo(
      () => parsePadding(spacingProps),
      [spacingProps],
    )
    const { isShown, isNone, debugging } = useDebug(debuggingProp, config.debugging)
    const enableSpacers = !isNone

    const internalRef = React.useRef<HTMLDivElement | null>(null)
    const { padding: { top, left, bottom, right } } = useBaseline(internalRef, {
      base: config.base,
      snapping: 'height',
      spacing: initialPadding,
      warnOnMisalignment: !isNone,
    })

    const setRefs = mergeRefs(ref, internalRef)

    const containerStyles = React.useMemo(
      () => mergeStyles({
        '--bk-padder-width': width ?? 'fit-content',
        '--bk-padder-height': height ?? 'fit-content',
        '--bk-padder-base': `${config.base}px`,
        '--bk-padder-color': config.color,

        ...(enableSpacers
          ? {}
          : {
            paddingBlock: `${top}px ${bottom}px`,
            paddingInline: `${left}px ${right}px`,
          }),
      } as React.CSSProperties,
      style,
      ),
      [width, height, config.base, config.color, enableSpacers, top, right, bottom, left, style],
    )

    const renderSpacer: RenderSpacerFn = (width, height) => (
      <Spacer
        variant={variant}
        debugging={debugging}
        indicatorNode={indicatorNode}
        height={height !== '100%' ? height : undefined}
        width={width !== '100%' ? width : undefined}
      />
    )

    return (
      <div
        ref={setRefs}
        className={mergeClasses(
          styles.padder,
          isShown && styles.visible,
          className,
        )}
        data-testid="padder"
        style={containerStyles}
      >
        {enableSpacers && (
          <>
            {top > 0 && renderSpacer('100%', top)}
            {left > 0 && renderSpacer(left, '100%')}
          </>
        )}

        {children}

        {enableSpacers && (
          <>
            {bottom > 0 && renderSpacer('100%', bottom)}
            {right > 0 && renderSpacer(right, '100%')}
          </>
        )}
      </div>
    )
  }),
)