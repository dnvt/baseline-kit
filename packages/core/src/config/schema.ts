import type { GuideVariant, BaselineVariant, Variant, DebuggingMode } from '../types'

type Colors = {
  line: string
  flat: string
  text: string
}

export type ConfigSchema = {
  base: number
  guide: {
    variant: GuideVariant
    debugging: DebuggingMode
    colors: Record<GuideVariant, string>
  }
  baseline: {
    variant: BaselineVariant
    debugging: DebuggingMode
    colors: Record<BaselineVariant, string>
  }
  stack: { colors: Colors; debugging: DebuggingMode }
  layout: { colors: Colors; debugging: DebuggingMode }
  spacer: { variant: Variant; debugging: DebuggingMode; colors: Colors }
  box: { colors: Colors; debugging: DebuggingMode }
  padder: { color: string; debugging: DebuggingMode }
}
