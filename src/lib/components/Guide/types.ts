import { CSSValue } from '@utils'
import { GuideColumnsPattern } from '../types'

type BaseGuideConfig = {
  gap?: number
  base?: number
}

export type PatternConfig = BaseGuideConfig & {
  variant: 'pattern'
  columns: GuideColumnsPattern
  columnWidth?: never
}

export type FixedConfig = BaseGuideConfig & {
  variant: 'fixed'
  columns: number
  columnWidth?: CSSValue
}

export type AutoConfig = BaseGuideConfig & {
  variant: 'auto'
  columnWidth: CSSValue
  columns?: never
}

export type LineConfig = BaseGuideConfig & {
  variant?: 'line'
  columns?: never
  columnWidth?: never
}
