import { CSSProperties, memo, ReactNode, useMemo, useRef } from 'react'
import { useConfig, useDimensionBaseMultiple } from '@hooks'
import {
  cx,
  cs,
  CSSValue,
  BlockInlineSpacing,
  PaddingSpacing,
  moduloize,
} from '@utils'
import { Config, Visibility } from '../Config'
import { Padder } from '../Padder'
import { ComponentsProps } from '../types'
import styles from './styles.module.css'

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
 * It can accept either block/inline spacing or padding. We partially transform
 * those spacing props by taking `(value % box.base)` so no spacing can exceed
 * the box base. Then we pass the result on to <Padder>.
 */
export const Box = memo(function Box({
  children,
  width = 'fit-content',
  height = 'fit-content',
  visibility,
  className,
  style,
  ['data-testid']: dataTest,
  ...spacingProps
}: Props) {
  const config = useConfig('box')
  const boxRef = useRef<HTMLDivElement | null>(null)

  const spacing = useMemo(() => {
    const result: Record<string, unknown> = {}
    for (const key in spacingProps) {
      const val = (spacingProps as any)[key]

      if (typeof val === 'number' || typeof val === 'string') {
        result[key] = moduloize(val as CSSValue, config.base)
      } else if (Array.isArray(val)) {
        result[key] = val.map((item) =>
          typeof item === 'number' || typeof item === 'string'
            ? moduloize(item as CSSValue, config.base)
            : item,
        )
      } else if (val && typeof val === 'object') {
        const objClone: Record<string, unknown> = {}
        for (const prop in val) {
          const subVal = (val as any)[prop]
          if (typeof subVal === 'number' || typeof subVal === 'string') {
            objClone[prop] = moduloize(subVal as CSSValue, config.base)
          } else {
            objClone[prop] = subVal
          }
        }
        result[key] = objClone
      } else {
        result[key] = val
      }
    }
    return result
  }, [spacingProps, config.base])

  const boxStyles = useMemo(() =>
    cs(
        {
          '--pdd-box-width': width,
          '--pdd-box-height': height,
          '--pdd-box-base': `${config.base}px`,
          '--pdd-box-color-line': config.colors.line,
        } as CSSProperties,
        style,
    ),
  [width, height, config.base, config.colors.line, style])

  useDimensionBaseMultiple(boxRef, config.base, true)

  return (
    <Config
      base={1}
      spacer={{
        variant: 'flat',
        colors: {
          flat: 'var(--pdd-box-color-flat-theme)',
          line: 'var(--pdd-box-color-line-theme)',
          indice: 'var(--pdd-box-color-indice-theme)',
        },
      }}
    >
      <div
        ref={boxRef}
        className={cx(styles.box, className)}
        data-testid={dataTest ?? 'box'}
        style={boxStyles}
      >
        <Padder {...spacing} width={width} height={height} visibility={visibility}>
          {children}
        </Padder>
      </div>
    </Config>
  )
})
