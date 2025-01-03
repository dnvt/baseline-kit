import type { CSSProperties } from 'react'
import type {
  ComponentsProps,
  CSSValue,
  GridAlignment,
  GridColumnsPattern,
  PaddedBaseConfig,
  PaddedVariant,
} from '@types'

// XGrid types -----------------------------------------------------------------

export type XGridVariant = 'line' | 'auto' | 'pattern' | 'fixed'

interface XGBaseConfig extends PaddedBaseConfig {
  align?: GridAlignment
  gap?: CSSValue
  maxWidth?: CSSValue
  padding?: CSSProperties['padding']
  variant?: XGridVariant
}

export interface PatternConfig extends XGBaseConfig {
  variant: 'pattern'
  columns: GridColumnsPattern
  columnWidth?: never
}

export interface FixedConfig extends XGBaseConfig {
  variant: 'fixed'
  columns: number
  columnWidth?: CSSValue
}

export interface AutoConfig extends XGBaseConfig {
  variant: 'auto'
  columnWidth: CSSValue
  columns?: never
}

export interface LineConfig extends XGBaseConfig {
  variant: 'line'
  columns?: never
  columnWidth?: never
}

export type XGConfig = PatternConfig | AutoConfig | FixedConfig | LineConfig

export interface XGProps extends ComponentsProps {
  config?: XGConfig
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

export interface YGConfig extends PaddedBaseConfig {
  variant?: PaddedVariant
  height?: CSSProperties['height']
}

export interface YGProps extends ComponentsProps {
  config?: YGConfig
}
