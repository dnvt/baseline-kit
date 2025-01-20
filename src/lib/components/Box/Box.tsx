import { CSSProperties, memo, ReactNode, useMemo } from 'react'
import { useConfig } from '@hooks'
import { cx, cs, CSSValue, BlockInlineSpacing, PaddingSpacing } from '@utils'
import styles from './styles.module.css'
import { Config, Visibility } from '../Config'
import { Padder } from '../Padder'
import { ComponentsProps } from '../types'

export type Props = ComponentsProps & {
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
 *
 * Should remain as simple of a wrapper.
 * Good from wrapping simple primitives like font elements.
 */
export const Box = memo(function Box({
  children,
  width = 'fit-content',
  height = 'fit-content',
  visibility,
  className,
  style,
  ...props
}: Props) {
  const config = useConfig('box')
  const spacerConfig = useConfig('spacer')

  const boxStyles = useMemo(() => cs({
    '--pdd-box-width': width,
    '--pdd-box-height': height,
    '--pdd-box-base': `${config.base}px`,
    '--pdd-box-color': config.colors.line,
  } as CSSProperties, style), [width, height, config.base, config.colors.line, style])

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
          visibility={visibility}
        >
          {children}
        </Padder>
      </div>
    </Config>
  )
})