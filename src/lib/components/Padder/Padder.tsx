import { CSSProperties, memo, ReactNode, useMemo } from 'react'
import { useConfig, useDebugging } from '@hooks'
import { cx, cs, CSSValue, normalizeSpacing } from '@utils'
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
  // Normalize block/inline or padding props against the base unit
  const spacing = useMemo(
    () => normalizeSpacing(spacingProps, config.base),
    [spacingProps, config.base],
  )

  // Determine debug state from prop or theme config
  const { isShown, isNone, debugging } = useDebugging(debuggingProp, config.debugging)
  // If debugging is "none", we skip Spacer elements and use direct CSS padding
  const enableSpacers = !isNone

  // Apply either direct padding (if none) or custom CSS variables for debug modes
  const containerStyles = useMemo(
    () =>
      cs(
        {
          '--pdd-padder-width': width ?? 'fit-content',
          '--pdd-padder-height': height ?? 'fit-content',
          '--pdd-padder-base': `${config.base}px`,
          '--pdd-padder-color': config.color,

          // If we're skipping spacers, just apply real CSS padding
          ...(enableSpacers
            ? {}
            : {
              paddingBlock: `${spacing.block[0]}px ${spacing.block[1]}px`,
              paddingInline: `${spacing.inline[0]}px ${spacing.inline[1]}px`,
            }),
        } as CSSProperties,
        style,
      ),
    [enableSpacers, spacing, width, height, config, style],
  )

  /**
   * Renders a Spacer for visual debugging or hidden placeholders.
   * If debugging is "none," no spacers are added at all.
   */
  const renderSpacer = (width: CSSValue, height: CSSValue) => (
    <Spacer width={width} height={height} debugging={debugging} />
  )

  return (
    <div
      className={cx(
        styles.padder,
        isShown && styles.visible, // Show padder highlights if debugging is visible
        className,
      )}
      data-testid="padder"
      style={containerStyles}
    >
      {enableSpacers && (
        <>
          {/* Top/Left spacing */}
          {spacing.inline[0] > 0 && renderSpacer(spacing.inline[0], '100%')}
          {spacing.block[0] > 0 && renderSpacer('100%', spacing.block[0])}
        </>
      )}

      {children}

      {enableSpacers && (
        <>
          {/* Bottom/Right spacing */}
          {spacing.block[1] > 0 && renderSpacer('100%', spacing.block[1])}
          {spacing.inline[1] > 0 && renderSpacer(spacing.inline[1], '100%')}
        </>
      )}
    </div>
  )
})