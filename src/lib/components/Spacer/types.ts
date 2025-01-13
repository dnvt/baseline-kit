import { ReactNode } from 'react'
import { ComponentsProps } from '@types'
import { CSSValue } from '@utils'
import { Visibility } from '@context'

export type SpacerDimension = 'width' | 'height'
export type SpacerDimensions = Record<'width' | 'height', CSSValue | '100%'>
export type SpacerIndicator = SpacerDimension | 'none'
export type IndicatorNode = (value: number, dimension: SpacerDimension) => ReactNode

//export type SpacerConfig = PaddedBaseConfig & { variant: PaddedVariant, grow?: boolean }

export type SpacerProps = {
  height?: CSSValue | 'fit-content' | 'auto'
  width?: CSSValue | 'fit-content' | 'auto'
  indicatorNode?: ((value: number, measurement: SpacerDimension) => ReactNode)
  visibility?: Visibility
} & ComponentsProps