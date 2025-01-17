import { CSSProperties, memo, ReactNode, useMemo } from 'react'
import { cx, cs, CSSValue, normalizeSpacing, BlockInlineSpacing, PaddingSpacing } from '@utils'
import { ComponentsProps } from '@types'
import styles from './styles.module.css'
import { useConfig, Visibility } from '../Config'
import { Spacer } from '../Spacer'

export type PadderProps = Omit<ComponentsProps, 'data-testid'> & (BlockInlineSpacing | PaddingSpacing) & {
  /** Width of the padder container */
  width?: CSSValue | 'fit-content' | 'auto'
  /** Height of the padder container */
  height?: CSSValue | 'fit-content' | 'auto'
  /** Content to be padded */
  children: ReactNode
  /** Override visibility from theme */
  visibility?: Visibility
}

/**
 * Padder Component
 * Manages spacing and padding with optional visual indicators.
 * Uses Spacer components to visualize padding when visible.
 */
export const Padder = memo(function Padder({
  children,
  className,
  height = 'fit-content',
  width = 'fit-content',
  visibility: visibilityProp,
  style,
  ...spacingProps
}: PadderProps) {
  const config = useConfig('padder')

  // Calculate normalized padding values
  const spacing = useMemo(() =>
    normalizeSpacing(spacingProps, config.base),
  [spacingProps, config.base])

  // Determine if spacers should be shown
  const visibility = visibilityProp ?? config.visibility
  const enableSpacers = visibility !== 'none'
  const showSpacers = visibility === 'visible'

  const containerStyles = useMemo(() => cs({
    '--padder-width': width,
    '--padder-height': height,
    '--padder-base': `${config.base}px`,
    '--padder-color': config.color,
    ...(enableSpacers ? {} : {
      paddingBlock: `${spacing.block[0]}px ${spacing.block[1]}px`,
      paddingInline: `${spacing.inline[0]}px ${spacing.inline[1]}px`,
    }),
  } as CSSProperties, style), [
    enableSpacers,
    spacing,
    width,
    height,
    config,
    style,
  ])

  return (
    <div
      className={cx(
        styles.padder,
        showSpacers && styles.visible,
        className,
      )}
      data-testid="padder"
      style={containerStyles}
    >
      {enableSpacers && (
        <>
          {/* Left spacing */}
          {spacing.inline[0] > 0 && (
            <Spacer
              width={spacing.inline[0]}
              height="100%"
              visibility="visible"
            />
          )}
          {/* Top spacing */}
          {spacing.block[0] > 0 && (
            <Spacer
              width="100%"
              height={spacing.block[0]}
              visibility="visible"
            />
          )}
        </>
      )}

      {children}

      {enableSpacers && (
        <>
          {/* Bottom spacing */}
          {spacing.block[1] > 0 && (
            <Spacer
              width="100%"
              height={spacing.block[1]}
              visibility="visible"
            />
          )}
          {/* Right spacing */}
          {spacing.inline[1] > 0 && (
            <Spacer
              width={spacing.inline[1]}
              height="100%"
              visibility="visible"
            />
          )}
        </>
      )}
    </div>
  )
})