import { CSSProperties, memo, ReactNode, useMemo } from 'react'
import { useConfig } from '@hooks'
import { cx, cs, CSSValue, normalizeSpacing, BlockInlineSpacing, PaddingSpacing } from '@utils'
import { ComponentsProps } from '../types'
import { Visibility } from '../Config'
import { Spacer } from '../Spacer'
import styles from './styles.module.css'
import { useVisibility } from '@/hooks/visibility/useVisibility'

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
 * Uses Spacer components to visualize padding within your components.
 */
export const Padder = memo(function Padder({
  children,
  className,
  height = 'fit-content',
  width = 'fit-content',
  visibility,
  style,
  ...spacingProps
}: PadderProps) {
  const config = useConfig('padder')
  const spacing = useMemo(() =>
    normalizeSpacing(spacingProps, config.base),
  [spacingProps, config.base],
  )

  const { isShown, isNone } = useVisibility(visibility, config.visibility)
  const enableSpacers = !isNone

  const containerStyles = useMemo(() => cs({
    '--pdd-padder-width': width,
    '--pdd-padder-height': height,
    '--pdd-padder-base': `${config.base}px`,
    '--pdd-padder-color': config.color,
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

  const renderSpacer = (width: CSSValue, height: CSSValue) => (
    <Spacer
      width={width}
      height={height}
      visibility="visible"
    />
  )

  return (
    <div
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
          {spacing.inline[0] > 0 && renderSpacer(spacing.inline[0], '100%')}
          {spacing.block[0] > 0 && renderSpacer('100%', spacing.block[0])}
        </>
      )}

      {children}

      {enableSpacers && (
        <>
          {spacing.block[1] > 0 && renderSpacer('100%', spacing.block[1])}
          {spacing.inline[1] > 0 && renderSpacer(spacing.inline[1], '100%')}
        </>
      )}
    </div>
  )
})
