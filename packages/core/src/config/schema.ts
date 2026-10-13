import type {
  GuideVariant,
  BaselineVariant,
  Variant,
  DebuggingMode,
} from '../types'

type DebugColors = { line: string; flat: string; text: string }

export type ConfigSchema = {
  /** The grid base in px. A root-relative base is stored here resolved. */
  base: number
  /**
   * Set when the base follows the root font size (`base="0.5rem"`): the base
   * in rem. Client components re-resolve `base` from it against the live root
   * font size; the server resolves it against 16px.
   */
  baseRem?: number
  domDiagnostics: boolean
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
  padder: { debugging: DebuggingMode; color: string }
}
