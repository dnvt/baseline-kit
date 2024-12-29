import type {
  BaseComponentProps,
  CSSValue,
  GridVariant,
} from '@types'
import type { CSSProperties } from 'react'

export interface GridLineStyles {
  '--grid-column-width': '1px';
  '--grid-row-height': '1px';
}

export interface GridFlatStyles {
  '--grid-column-width': CSSValue;
  '--grid-row-height': CSSValue;
  '--grid-row-opacity': '0' | '1';
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
}
