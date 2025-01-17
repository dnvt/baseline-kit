import { CSSProperties, memo, ReactNode, useMemo } from 'react'
import { cx, cs, CSSValue, BlockInlineSpacing, PaddingSpacing } from '@utils'
import type { ComponentsProps } from '@types'
import styles from './styles.module.css'
import { Config, useConfig, Visibility } from '../Config'
import { Padder } from '../Padder'

export type BoxProps = ComponentsProps & {
  /** Width of the box */
  width?: CSSValue | 'fit-content' | 'auto'
  /** Height of the box */
  height?: CSSValue | 'fit-content' | 'auto'
  /** Override visibility from theme */
  visibility?: Visibility
  /** Content to be wrapped */
  children?: ReactNode
} & (BlockInlineSpacing | PaddingSpacing)

/**
 * Box Component
 * A container component that provides consistent spacing and visual styling.
 * Uses Padder for spacing management and integrates with theme context.
 */
export const Box = memo(function Box({
  children,
  width = 'fit-content',
  height = 'fit-content',
  visibility,
  className,
  style,
  ...props
}: BoxProps) {
  const config = useConfig('box')
  const spacerConfig = useConfig('spacer')

  const boxStyles = useMemo(() => cs({
    '--box-width': width,
    '--box-height': height,
    '--box-base': `${config.base}px`,
    '--box-color': config.colors.line,
  } as CSSProperties, style), [
    width,
    height,
    config,
    style,
  ])

  return (
    <Config
      base={1}
      spacer={{
        variant: 'flat',
        colors: { ...spacerConfig.colors, flat: config.colors.flat },
      }}
    >
      <div
        className={cx(styles.box, className)}
        data-testid="box"
        style={boxStyles}
      >
        <Padder
          {...props}
          width={width}
          height={height}
          visibility={visibility ?? config.visibility}
        >
          {children}
        </Padder>
      </div>
    </Config>
  )
})