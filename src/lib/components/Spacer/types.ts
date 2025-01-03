import { ReactNode } from 'react'
import { ComponentsProps, CSSValue, ExclusiveProps, PaddedBaseConfig, PaddedVariant } from '@types'

export type SpacerDimension = 'width' | 'height'
export type SpacerDimensions = Record<'width' | 'height', CSSValue | '100%'>
export type SpacerIndicator = SpacerDimension | 'none'
export type IndicatorNode = (value: number, dimension: SpacerDimension) => ReactNode

export type SpacerConfig = PaddedBaseConfig & { variant: PaddedVariant }

export type SpacerProps = ExclusiveProps<{
  config?: SpacerConfig
  height?: CSSValue
  width?: CSSValue
  indicatorNode?: ((value: number, measurement: SpacerDimension) => ReactNode)
}, 'height' | 'width'> & ComponentsProps