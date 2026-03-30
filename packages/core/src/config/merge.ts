import type { ConfigSchema } from './schema'

type MergeConfigParams = {
  parentConfig: ConfigSchema
  base?: number
  baseline?: Partial<ConfigSchema['baseline']>
  guide?: Partial<ConfigSchema['guide']>
  spacer?: Partial<ConfigSchema['spacer']>
  box?: Partial<ConfigSchema['box']>
  stack?: Partial<ConfigSchema['stack']>
  layout?: Partial<ConfigSchema['layout']>
  padder?: Partial<ConfigSchema['padder']>
}

const COMPONENT_KEYS = ['baseline', 'guide', 'spacer', 'box', 'stack', 'layout', 'padder'] as const

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
  stack: ConfigSchema['stack']
  spacer: ConfigSchema['spacer']
  layout: ConfigSchema['layout']
  box: ConfigSchema['box']
  padder: ConfigSchema['padder']
}

export const createCSSVariables = (params: CSSVariablesParams): Record<string, string> => {
  const { base, baseline, guide, stack, spacer, layout, box, padder } = params
  return {
    '--bkb': `${base}px`,
    '--bkbcl': baseline.colors.line,
    '--bkbcf': baseline.colors.flat,
    '--bkgcl': guide.colors.line,
    '--bkgcp': guide.colors.pattern,
    '--bkgca': guide.colors.auto,
    '--bkgcf': guide.colors.fixed,
    '--bkscl': spacer.colors.line,
    '--bkscf': spacer.colors.flat,
    '--bksci': spacer.colors.text,
    '--bkxcl': box.colors.line,
    '--bkxcf': box.colors.flat,
    '--bkxci': box.colors.text,
    '--bkkcl': stack.colors.line,
    '--bkkcf': stack.colors.flat,
    '--bkkci': stack.colors.text,
    '--bklcl': layout.colors.line,
    '--bklcf': layout.colors.flat,
    '--bklci': layout.colors.text,
    '--bkpc': padder.color,
  }
}
