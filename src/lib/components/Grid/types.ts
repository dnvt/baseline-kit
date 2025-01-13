import type { CSSProperties } from 'react'
import type {
  ComponentsProps,
  GridAlignment,
  GridColumnsPattern,
  PaddedBaseConfig,
  PaddedVariant,
} from '@types'
import { CSSValue } from '@utils'

// XGrid types -----------------------------------------------------------------

export type XGridVariant = 'line' | 'auto' | 'pattern' | 'fixed'

type XGBaseConfig = {
  align?: GridAlignment
  gap?: CSSValue
  maxWidth?: CSSValue
  padding?: CSSProperties['padding']
  variant?: XGridVariant
} & PaddedBaseConfig

export type PatternConfig = {
  variant: 'pattern'
  columns: GridColumnsPattern
  columnWidth?: never
} & XGBaseConfig

export type FixedConfig = {
  variant: 'fixed'
  columns: number
  columnWidth?: CSSValue
} & XGBaseConfig

export type AutoConfig = {
  variant: 'auto'
  columnWidth: CSSValue
  columns?: never
} & XGBaseConfig

export type LineConfig = {
  variant: 'line'
  columns?: never
  columnWidth?: never
} & XGBaseConfig

export type XGConfig = PatternConfig | AutoConfig | FixedConfig | LineConfig

export type XGProps = {
  config?: XGConfig
} & ComponentsProps

// YGrid types -----------------------------------------------------------------

export type GridLineStyles = {
  '--grid-column-width': '1px'
  '--grid-row-height': '1px'
}

export type GridFlatStyles = {
  '--grid-column-width': CSSValue
  '--grid-row-height': CSSValue
  '--grid-row-opacity': '0' | '1'
}

export type YGConfig = {
  variant?: PaddedVariant
  height?: CSSProperties['height']
} & PaddedBaseConfig

export type YGProps = {
  config?: YGConfig
} & ComponentsProps
