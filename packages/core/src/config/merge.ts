import type { ConfigSchema } from './schema'
import { DEFAULT_ROOT_FONT_SIZE, parseRemBase, type BaseValue } from './base'

type PartialColors<T> = T extends { colors: infer Colors }
  ? Omit<Partial<T>, 'colors'> & { colors?: Partial<Colors> }
  : Partial<T>

export type ConfigOverrides = {
  /** The grid base: px as a number, or `'0.5rem'` to follow the root font size. */
  base?: BaseValue
  domDiagnostics?: boolean
  baseline?: PartialColors<ConfigSchema['baseline']>
  guide?: PartialColors<ConfigSchema['guide']>
  spacer?: PartialColors<ConfigSchema['spacer']>
  box?: PartialColors<ConfigSchema['box']>
  padder?: Partial<ConfigSchema['padder']>
}

type MergeConfigParams = ConfigOverrides & {
  parentConfig: ConfigSchema
  /** The root font size a rem base resolves against. Defaults to 16. */
  rootFontSize?: number
}

const COMPONENT_KEYS = ['baseline', 'guide', 'spacer', 'box', 'padder'] as const

const warnedBases = new Set<string>()

function warnInvalidBase(base: unknown) {
  const text = String(base)
  if (warnedBases.has(text)) return
  warnedBases.add(text)
  console.warn(
    `baseline-kit: Config base ${JSON.stringify(base)} is neither a number nor a positive rem value such as '0.5rem'; using the inherited base.`
  )
}

export const mergeConfig = (params: MergeConfigParams): ConfigSchema => {
  const {
    parentConfig,
    base,
    domDiagnostics,
    rootFontSize = DEFAULT_ROOT_FONT_SIZE,
  } = params
  const merged = {} as Record<string, unknown>

  for (const key of COMPONENT_KEYS) {
    const override = params[key]
    const inherited = parentConfig[key]
    const next = { ...inherited, ...override } as Record<string, unknown>

    if (
      override &&
      'colors' in override &&
      override.colors &&
      'colors' in inherited
    ) {
      next.colors = {
        ...(inherited.colors as Record<string, string>),
        ...(override.colors as Record<string, string>),
      }
    }

    merged[key] = next
  }

  // An own base replaces the inherited one; an unset or invalid one keeps
  // the parent's, already resolved.
  const ownRem = parseRemBase(base)
  const ownBase = typeof base === 'number' || ownRem !== undefined
  if (base !== undefined && !ownBase) warnInvalidBase(base)
  const baseRem = ownBase ? ownRem : parentConfig.baseRem
  return {
    base:
      ownRem !== undefined
        ? ownRem * rootFontSize
        : typeof base === 'number'
          ? base
          : parentConfig.base,
    ...(baseRem !== undefined ? { baseRem } : {}),
    domDiagnostics: domDiagnostics ?? parentConfig.domDiagnostics ?? false,
    ...merged,
  } as ConfigSchema
}

type CSSVariablesParams = {
  base: number
  baseline: ConfigSchema['baseline']
  guide: ConfigSchema['guide']
  spacer: ConfigSchema['spacer']
  box: ConfigSchema['box']
  padder: ConfigSchema['padder']
}

export const createCSSVariables = (
  params: CSSVariablesParams
): Record<string, string> => {
  const { base, baseline, guide, spacer, box, padder } = params
  return {
    '--bk-base': `${base}px`,
    '--bkbl-cl': baseline.colors.line,
    '--bkbl-cf': baseline.colors.flat,
    '--bkgd-cl': guide.colors.line,
    '--bkgd-cp': guide.colors.pattern,
    '--bkgd-ca': guide.colors.auto,
    '--bkgd-cf': guide.colors.fixed,
    '--bksp-cl': spacer.colors.line,
    '--bksp-cf': spacer.colors.flat,
    '--bksp-ct': spacer.colors.text,
    '--bkbx-cl': box.colors.line,
    '--bkbx-cf': box.colors.flat,
    '--bkbx-ct': box.colors.text,
    '--bkpd-c': padder.color,
  }
}
