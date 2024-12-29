import type {
  BaseComponentProps,
  BaseGridStyles,
  CSSCustomProperties,
  GridFlatStyles,
  GridLineStyles,
  GridVariant,
} from '@types'
import type { CSSProperties } from 'react'

export interface YGStyles extends Partial<BaseGridStyles> {
  '--grid-height'?: string
  '--grid-row-top'?: string
  '--grid-row-color'?: string
  '--grid-row-height'?: GridVariant extends 'line'
    ? GridLineStyles['--grid-row-height']
    : string
  '--grid-row-opacity'?: GridVariant extends 'flat'
    ? GridFlatStyles['--grid-row-opacity']
    : string
  visibility?: 'visible' | 'hidden'

}

export interface YGContainerStyles
  extends Partial<CSSProperties & CSSCustomProperties> {
  '--grid-height'?: string;
  '--grid-z-index'?: string | number;
  '--grid-row-color'?: string;
}

export interface YGConfig {
  variant?: GridVariant
  color?: CSSProperties['color'] | CSSProperties['backgroundColor']
  height?: CSSProperties['height']
  baseUnit?: number
  zIndex?: CSSProperties['zIndex']
}

export interface YGProps extends BaseComponentProps {
  config: YGConfig
  visibility?: 'hidden' | 'visible';
  style?: Partial<YGStyles>
}
