import type { CSSProperties } from 'react'
import type {
  ComponentsProps,
  CSSPixelValue,
  CSSValue,
  GridAlignment,
  GridColumnsPattern,
  PaddedVariant,
} from '@types'

// XGrid types -----------------------------------------------------------------

export type XGridVariant = 'line' | 'auto' | 'pattern' | 'fixed'

interface XGBaseConfig {
  align?: GridAlignment
  color?: CSSProperties['color'] | CSSProperties['backgroundColor']
  gap?: CSSPixelValue
  maxWidth?: CSSValue
  padding?: CSSProperties['padding']
  zIndex?: CSSProperties['zIndex']
  variant?: XGridVariant
}

export interface XGPatternConfig extends XGBaseConfig {
  variant: 'pattern'
  columns: GridColumnsPattern
  columnWidth?: never
}

export interface XGFixedConfig extends XGBaseConfig {
  variant: 'fixed'
  columns: number
  columnWidth?: CSSValue
}

export interface XGAutoConfig extends XGBaseConfig {
  variant: 'auto'
  columnWidth: CSSValue
  columns?: never
}

export interface XGLineConfig extends XGBaseConfig {
  variant: 'line'
  columns?: never
  columnWidth?: never
}

export type XGConfig =
  | XGPatternConfig
  | XGAutoConfig
  | XGFixedConfig
  | XGLineConfig

export interface XGProps extends ComponentsProps {
  config: XGConfig
}

// YGrid types -----------------------------------------------------------------

export interface GridLineStyles {
  '--grid-column-width': '1px'
  '--grid-row-height': '1px'
}

export interface GridFlatStyles {
  '--grid-column-width': CSSValue
  '--grid-row-height': CSSValue
  '--grid-row-opacity': '0' | '1'
}

export interface YGConfig {
  variant?: PaddedVariant
  color?: CSSProperties['color'] | CSSProperties['backgroundColor']
  height?: CSSProperties['height']
  baseUnit?: number
  zIndex?: CSSProperties['zIndex']
}

export interface YGProps extends ComponentsProps {
  config?: YGConfig
}
