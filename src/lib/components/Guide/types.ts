import type { CSSProperties } from 'react'
import type {
  ComponentsProps,
  GridAlignment,
  GridColumnsPattern,
  PaddedBaseConfig,
} from '@types'
import { CSSValue, Direction } from '@utils'

export type GuideVariant = 'line' | 'pattern' | 'fixed' | 'auto'

type BaseConfig = {
  align?: GridAlignment
  direction?: Direction
  gap?: CSSValue
  maxWidth?: CSSValue
  height?: CSSValue
  padding?: CSSProperties['padding']
  variant?: GuideVariant
} & PaddedBaseConfig

export type PatternConfig = {
  variant: 'pattern'
  columns: GridColumnsPattern
  columnWidth?: never
} & BaseConfig

export type FixedConfig = {
  variant: 'fixed'
  columns: number
  columnWidth?: CSSValue
} & BaseConfig

export type AutoConfig = {
  variant: 'auto'
  columnWidth: CSSValue
  columns?: never
} & BaseConfig

export type LineConfig = {
  variant: 'line'
  columns?: never
  columnWidth?: never
} & BaseConfig

export type GuideConfig = PatternConfig | AutoConfig | FixedConfig | LineConfig

export type GuideProps = {
  variant?: GuideVariant
} & (
  | { variant?: 'pattern'; columns?: GridColumnsPattern; columnWidth?: never }
  | { variant?: 'fixed'; columns?: number; columnWidth?: CSSValue }
  | { variant?: 'auto'; columnWidth?: CSSValue; columns?: never }
  | { variant?: 'line'; columns?: never; columnWidth?: never }
  ) & {
  align?: GridAlignment
  direction?: Direction
  gap?: CSSValue
  maxWidth?: CSSValue
  height?: CSSValue
  padding?: CSSProperties['padding']
} & ComponentsProps
