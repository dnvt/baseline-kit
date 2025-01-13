import { CSSProperties, memo, useMemo } from 'react'
import { Padder } from '@components'
import { BOX as CONFIG } from '@config'
import { cx, cs, Padding, normalizePadding } from '@utils'
import type { BoxContentProps, BoxProps } from './types'
import styles from './styles.module.css'
import { THEME, useComponentConfig, useConfig, ConfigContext } from '@context'


function BoxContent({
  children,
  spacing,
  width,
  height,
  className,
  style,
}: BoxContentProps) {
  const { baseUnit } = useComponentConfig('box')
  const b = (num: number) => num % baseUnit

  return (
    <div
      className={cx(styles.box, className)}
      data-testid="box"
      style={cs({
        '--box-block-start': `${b(spacing.block[0])}px`,
        '--box-block-end': `${b(spacing.block[1])}px`,
        '--box-inline-start': `${b(spacing.inline[0])}px`,
        '--box-inline-end': `${b(spacing.inline[1])}px`,
        '--box-width': width,
        '--box-height': height,
      } as CSSProperties, style)}
    >
      {children}
    </div>
  )
}

export const Box = memo(function Box({
  children,
  width = 'fit-content',
  height = 'fit-content',
  visibility = 'none',
  className,
  style,
  ...spacingProps
}: BoxProps) {
  const config = useComponentConfig('box')
  const spacing = useMemo(() =>
    normalizePadding(spacingProps as Padding),
  [spacingProps])

  const content = visibility !== THEME.visibility.none ? (
    <ConfigContext value={{
      spacer: { baseUnit: 1 },
      padder: { baseUnit: 1 },
    }}>
      <Padder {...spacingProps} width={width} height={height}>
        {children}
      </Padder>
    </ConfigContext>
  ) : (
    <BoxContent
      spacing={spacing}
      width={width}
      height={height}
      className={className}
      style={style}
    >
      {children}
    </BoxContent>
  )

  return content

})


