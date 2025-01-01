import { ReactNode } from 'react'
import { ComponentsProps, CSSPixelValue, CSSValue, PaddedCommonConfig } from '@types'

export type SpacerDimension = 'width' | 'height'
export type SpacerDimensions = Record<'width' | 'height', CSSValue | '100%'>
export type SpacerIndicator = SpacerDimension | 'none'
export type IndicatorNode = (value: number, dimension: SpacerDimension) => ReactNode

export interface LineSpacerConfig extends PaddedCommonConfig {
  variant: 'line'
  width?: never
  height?: never
}

export interface FlatSpacerConfig extends PaddedCommonConfig {
  variant: 'flat'
  width?: CSSPixelValue
  height?: CSSPixelValue
}

export type SpacerConfig =
  | LineSpacerConfig
  | FlatSpacerConfig
  | (PaddedCommonConfig & { variant?: never })

export type SpacerProps = {
  config?: SpacerConfig
  indicatorNode?: IndicatorNode
} & ComponentsProps & (
  | { height: CSSPixelValue; width?: never }
  | { width: CSSPixelValue; height?: never }
  )