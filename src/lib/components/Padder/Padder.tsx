import { CSSProperties, memo, useMemo } from 'react'
import { useComponentConfig, THEME } from '@context'
import { Spacer } from '@components'
import { cx, cs, normalizePadding } from '@utils'
import type { PadderProps } from './types'
import type { Padding } from '@utils'
import styles from './styles.module.css'

export const Padder = memo(function Padder({
  children,
  className = '',
  height = 'fit-content',
  style = {},
  width = 'fit-content',
  ...spacingProps
}: PadderProps) {
  const config = useComponentConfig('padder')
  const spacing = useMemo(() =>
    normalizePadding(spacingProps as Padding),
  [spacingProps])

  return (
    <div
      className={cx(className, styles.padder)}
      data-testid="padder"
      style={cs(style, {
        '--padder-width': width,
        '--padder-height': height,
      } as CSSProperties)}
    >
      {spacing.inline[0] > 0 && (
        <Spacer
          width={spacing.inline[0]}
          height="100%"
          visibility={THEME.visibility.visible}
        />
      )}
      {spacing.block[0] > 0 && (
        <Spacer
          width="100%"
          height={spacing.block[0]}
          visibility={THEME.visibility.visible}
        />
      )}
      {children}
      {spacing.block[1] > 0 && (
        <Spacer
          width="100%"
          height={spacing.block[1]}
          visibility={THEME.visibility.visible}
        />
      )}
      {spacing.inline[1] > 0 && (
        <Spacer
          width={spacing.inline[1]}
          height="100%"
          visibility={THEME.visibility.visible}
        />
      )}
    </div>
  )
})
