import type { CSSProperties } from 'react'
import type {
  GridAlignment,
  CSSValue,
  ResponsiveValue,
  GridVariant,
  BaseGridStyles,
  GridLineStyles,
  GridColumnsPattern,
  BaseGridConfig, BaseComponentProps,
} from '@types'

export interface XGStyles extends BaseGridStyles {
  '--grid-template-columns': CSSProperties['gridTemplateColumns']
  '--grid-gap': string | number
  '--grid-padding': CSSProperties['padding']
  '--grid-columns': number
  '--column-color': CSSProperties['color'] | CSSProperties['backgroundColor']
  '--column-width': GridVariant extends 'line'
    ? GridLineStyles['--column-width']
    : CSSValue
}

export interface XGridBaseConfig extends BaseGridConfig {
  align?: GridAlignment
  color?: CSSProperties['color'] | CSSProperties['backgroundColor']
  maxWidth?: ResponsiveValue<CSSValue>
  padding?: CSSProperties['padding']
}

export interface XGridPatternConfig extends XGridBaseConfig {
  variant?: never
  columns: GridColumnsPattern
  gap: ResponsiveValue<CSSValue | 'auto'>
  columnWidth?: never
}

export interface XGridAutoConfig extends XGridBaseConfig {
  variant?: never
  columnWidth: ResponsiveValue<CSSValue | 'auto'>
  columns?: never
  gap: ResponsiveValue<CSSValue | 'auto'>
}

export interface XGridFixedConfig extends XGridBaseConfig {
  variant?: never
  columns: number
  columnWidth?: ResponsiveValue<CSSValue | 'auto'>
  gap?: ResponsiveValue<CSSValue | 'auto'>
}

export interface XGridLineConfig extends XGridBaseConfig {
  variant: GridVariant
  columns?: never
  columnWidth?: never
  gap?: ResponsiveValue<CSSValue>
}

export type XGridConfig =
  | XGridPatternConfig
  | XGridAutoConfig
  | XGridFixedConfig
  | XGridLineConfig


export interface XGProps extends BaseComponentProps {
  config: XGridConfig
  style?: Partial<XGStyles>
}