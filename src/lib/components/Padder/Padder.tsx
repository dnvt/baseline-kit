import { CSSProperties, memo, ReactNode, useMemo, useRef } from 'react'
import { useConfig, useDebug, useBaseline } from '@hooks'
import { cx, cs, CSSValue, parsePadding } from '@utils'
import { ComponentsProps } from '../types'
import { Spacer } from '../Spacer'
import styles from './styles.module.css'

type PadderProps = {
  children?: ReactNode
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
export const Padder = memo(function Padder({
  children,
  className,
  height,
  width,
  debugging: debuggingProp,
  style,
  ...spacingProps
}: PadderProps) {
  const config = useConfig('padder')

  // Use getPadding to extract initial padding values
  const initialPadding = useMemo(
    () => parsePadding(spacingProps),
    [spacingProps],
  )

  // Determine debug state from prop or theme config
  const { isShown, isNone } = useDebug(debuggingProp, config.debugging)

  // If debugging is "none", we skip Spacer elements and use direct CSS padding
  const enableSpacers = !isNone


  // Use useBaseline to adjust padding based on baseline grid
  const padderRef = useRef<HTMLDivElement | null>(null)
  const { padding: { top, left, bottom, right } } = useBaseline(padderRef, {
    base: config.base,
    snapping: 'height',
    spacing: initialPadding,
    warnOnMisalignment: !isNone,
  })

  // Apply either direct padding (if none) or custom CSS variables for debug modes
  const containerStyles = useMemo(
    () =>
      cs(
        {
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
        } as CSSProperties,
        style,
      ),
    [width, height, config.base, config.color, enableSpacers, top, right, bottom, left, style],
  )

  // Function to render Spacer components
  const renderSpacer = (width: CSSValue, height: CSSValue) => (
    <Spacer
      width={width}
      height={height}
      debugging={isShown ? 'visible' : 'hidden'}
    />
  )

  return (
    <div
      ref={padderRef}
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
})