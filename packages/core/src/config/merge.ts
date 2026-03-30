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

export const mergeConfig = (params: MergeConfigParams): ConfigSchema => {
  const { parentConfig, base, baseline, guide, spacer, box, stack, layout, padder } = params
  return {
    base: base ?? parentConfig.base,
    baseline: { ...parentConfig.baseline, ...baseline },
    guide: { ...parentConfig.guide, ...guide },
    spacer: { ...parentConfig.spacer, ...spacer },
    box: { ...parentConfig.box, ...box },
    stack: { ...parentConfig.stack, ...stack },
    layout: { ...parentConfig.layout, ...layout },
    padder: { ...parentConfig.padder, ...padder },
  }
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
