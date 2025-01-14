import { CSSProperties, memo, useMemo } from 'react'
import { useComponentConfig } from '@context'
import { Spacer } from '@components'
import { cx, cs, normalizePadding } from '@utils'
import type { PadderProps } from './types'
import type { Padding } from '@utils'
import styles from './styles.module.css'

export const Padder = memo(function Padder({
  children,
  className = '',
  height = 'fit-content',
  width = 'fit-content',
  visibility = 'none',
  style = {},
  ...spacingProps
}: PadderProps) {
  const config = useComponentConfig('padder')
  const { color, baseUnit, zIndex, variant } = config

  const spacing = useMemo(() =>
    normalizePadding(spacingProps as Padding),
  [spacingProps])

  const showSpacers = visibility !== 'none'
  const paddingStyles = showSpacers ? {} : {
    paddingBlock: `${spacing.block[0]}px ${spacing.block[1]}px`,
    paddingInline: `${spacing.inline[0]}px ${spacing.inline[1]}px`,
  }

  return (
    <div
      className={cx(className, styles.padder, visibility === 'visible' && styles.show)}
      data-testid="padder"
      data-variant={variant}
      style={cs({
        '--padder-width': width,
        '--padder-height': height,
        '--padder-color': color,
        '--padder-base-unit': `${baseUnit}px`,
        '--padder-z-index': zIndex,
        ...paddingStyles,
      } as CSSProperties, style)}
    >
      {showSpacers && spacing.inline[0] > 0 && (
        <Spacer
          width={spacing.inline[0]}
          height="100%"
          visibility="visible"
        />
      )}
      {showSpacers && spacing.block[0] > 0 && (
        <Spacer
          width="100%"
          height={spacing.block[0]}
          visibility="visible"
        />
      )}
      {children}
      {showSpacers && spacing.block[1] > 0 && (
        <Spacer
          width="100%"
          height={spacing.block[1]}
          visibility="visible"
        />
      )}
      {showSpacers && spacing.inline[1] > 0 && (
        <Spacer
          width={spacing.inline[1]}
          height="100%"
          visibility="visible"
        />
      )}
    </div>
  )
})
