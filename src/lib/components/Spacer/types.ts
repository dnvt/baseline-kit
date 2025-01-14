import { ReactNode } from 'react'
import { ComponentsProps } from '@types'
import { CSSValue } from '@utils'
import { Visibility } from '@context'

export type SpacerDimension = 'width' | 'height'
export type SpacerDimensions = Record<'width' | 'height', CSSValue | '100%'>
export type SpacerIndicator = SpacerDimension | 'none'
export type IndicatorNode = (value: number, dimension: SpacerDimension) => ReactNode

export type SpacerColors = {
  line: string
  flat: string
  indice: string
}

export type SpacerProps = {
  height?: CSSValue
  width?: CSSValue
  indicatorNode?: IndicatorNode
  visibility?: Visibility
} & ComponentsProps