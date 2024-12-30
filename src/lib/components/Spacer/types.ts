import { ComponentsProps, CSSValue } from '@types'

export type SpacerConfig<T extends 'height' | 'width'> = {
  baseUnit?: number
  variant?: 'line' | 'flat'
  measurements?: 'none' | T
}

export type SpacerProps = ({
  config?: SpacerConfig<'height'>
  height: CSSValue
  width?: CSSValue
} | {
  config?: SpacerConfig<'width'>
  height?: CSSValue
  width: CSSValue
}) & ComponentsProps
