import * as React from 'react'
import { useConfig, useDebug, useBaseline } from '@hooks'
import { cx, cs, parsePadding } from '@utils'
import { ComponentsProps } from '../types'
import { IndicatorNode, Spacer } from '../Spacer'
import styles from './styles.module.css'

type RenderSpacerFn = (width: React.CSSProperties['width'], height: React.CSSProperties['height']) => React.ReactNode

type PadderProps = {
  /** Function that renders a custom indicator (e.g., a label) showing the spacer's measured dimensions */
  indicatorNode?: IndicatorNode
  children?: React.ReactNode
} & ComponentsProps

/**
 * Padder - A low-level utility component for applying consistent spacing
 * around its children. In debug modes, it renders Spacer elements to
 * visually indicate padding boundaries.
 *
 * @remarks
 * - **Spacing**: Accepts either Block/Inline spacing or Padding props. Internally,
 *   this is normalized to pixel values based on the configured base unit.
 * - **Debugging**: If `debugging` is "none", `<Padder>` applies CSS padding directly.
 *   For "hidden" or "visible", it inserts `<Spacer>` elements in place of direct padding,
 *   letting you inspect or hide the padding boundaries.
 * - **Integration**: Often used inside components like `<Box>` or layout wrappers to
 *   manage interior spacing consistently with your design system.
 *
 * @example
 * ```tsx
 * <Padder block={16} inline={8} debugging="visible">
 *   <Text />
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

    // Use getPadding to extract initial padding values
    const initialPadding = React.useMemo(
      () => parsePadding(spacingProps),
      [spacingProps],
    )

    // Determine debug state from prop or theme config
    const { isShown, isNone, debugging } = useDebug(debuggingProp, config.debugging)

    // If debugging is "none", we skip Spacer elements and use direct CSS padding
    const enableSpacers = !isNone

    // Use useBaseline to adjust padding based on baseline grid
    const internalRef = React.useRef<HTMLDivElement | null>(null)
    const { padding: { top, left, bottom, right } } = useBaseline(internalRef, {
      base: config.base,
      snapping: 'height',
      spacing: initialPadding,
      warnOnMisalignment: !isNone,
    })

    const setRefs = React.useCallback((node: HTMLDivElement | null) => {
      internalRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }, [ref])

    // Apply either direct padding (if none) or custom CSS variables for debug modes
    const containerStyles = React.useMemo(
      () => cs({
        '--pdd-padder-width': width ?? 'fit-content',
        '--pdd-padder-height': height ?? 'fit-content',
        '--pdd-padder-base': `${config.base}px`,
        '--pdd-padder-color': config.color,

        // Apply adjusted padding when spacers are disabled
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
        debugging={debugging}
        indicatorNode={indicatorNode}
        height={height}
        width={width}
      />
    )

    return (
      <div
        ref={setRefs}
        className={cx(
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