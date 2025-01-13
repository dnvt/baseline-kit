import { ReactNode } from 'react'
import { ComponentsProps } from '@types'
import { CSSValue, normalizePadding, Spacing } from '@utils'
import { Visibility } from '@context'


export type BoxConfig = {
  baseUnit?: number
  color?: string
  zIndex?: string | number
}

export type BoxProps = {
  block?: Spacing
  inline?: Spacing
  width?: CSSValue | 'fit-content' | 'auto'
  height?: CSSValue | 'fit-content' | 'auto'
  visibility?: Visibility
  children?: ReactNode
} & ComponentsProps

export type BoxContentProps = {
  children: ReactNode
  spacing: ReturnType<typeof normalizePadding>
  width: CSSValue | 'fit-content' | 'auto'
  height: CSSValue | 'fit-content' | 'auto'
} & ComponentsProps