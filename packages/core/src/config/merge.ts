import type { ConfigSchema } from './schema'

type MergeConfigParams = {
  parentConfig: ConfigSchema
  base?: number
  baseline?: Partial<ConfigSchema['baseline']>
  guide?: Partial<ConfigSchema['guide']>
  spacer?: Partial<ConfigSchema['spacer']>
  box?: Partial<ConfigSchema['box']>
  padder?: Partial<ConfigSchema['padder']>
}

const COMPONENT_KEYS = ['baseline', 'guide', 'spacer', 'box', 'padder'] as const

export const mergeConfig = (params: MergeConfigParams): ConfigSchema => {
  const { parentConfig, base } = params
  const merged = {} as Record<string, unknown>

  for (const key of COMPONENT_KEYS) {
    merged[key] = { ...parentConfig[key], ...params[key] }
  }

  return { base: base ?? parentConfig.base, ...merged } as ConfigSchema
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
