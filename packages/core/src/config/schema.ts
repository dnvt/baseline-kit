import type {
  GuideVariant,
  BaselineVariant,
  Variant,
  DebuggingMode,
} from '../types'

type DebugColors = { line: string; flat: string; text: string }

export type ConfigSchema = {
  base: number
  baseline: {
    variant: BaselineVariant
    debugging: DebuggingMode
    colors: Record<BaselineVariant, string>
  }
  guide: {
    variant: GuideVariant
    debugging: DebuggingMode
    colors: Record<GuideVariant, string>
  }
  spacer: { variant: Variant; debugging: DebuggingMode; colors: DebugColors }
  box: { debugging: DebuggingMode; colors: DebugColors }
  stack: { debugging: DebuggingMode; colors: DebugColors }
  layout: { debugging: DebuggingMode; colors: DebugColors }
  padder: { debugging: DebuggingMode; color: string }
}
