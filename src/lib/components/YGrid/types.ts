import type { CSSProperties } from 'react'
import type {
  BaseComponentProps,
  BaseGridConfig,
  BaseGridStyles,
  CSSCustomProperties,
  GridFlatStyles,
  GridLineStyles,
  GridVariant,
} from '@types'

export interface YGStyles extends Partial<BaseGridStyles> {
  '--grid-height'?: string
  '--row-top'?: string
  '--row-color'?: string
  '--row-height'?: GridVariant extends 'line'
    ? GridLineStyles['--row-height']
    : string
  '--row-opacity'?: GridVariant extends 'flat'
    ? GridFlatStyles['--row-opacity']
    : string
}

export interface YGContainerStyles extends Partial<CSSProperties & CSSCustomProperties> {
  '--grid-height'?: string
  opacity?: 0 | 1
  visibility?: 'visible' | 'hidden'
}

export interface YGridConfig extends BaseGridConfig {
  variant?: GridVariant
  color?: CSSProperties['color'] | CSSProperties['backgroundColor']
  height?: CSSProperties['height']
  baseUnit?: number
}

export interface YGProps extends BaseComponentProps {
  config: YGridConfig
  style?: Partial<YGStyles>
}