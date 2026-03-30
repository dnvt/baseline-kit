import { parseUnit } from './parse'

export interface ConversionContext {
  parentSize?: number
  viewportWidth?: number
  viewportHeight?: number
  rootFontSize?: number
  parentFontSize?: number
}

const STATIC_DEFAULTS: Required<ConversionContext> = {
  parentSize: 0,
  viewportWidth: 1920,
  viewportHeight: 1080,
  rootFontSize: 16,
  parentFontSize: 16,
}

function getDefaultContext(): Required<ConversionContext> {
  if (typeof window === 'undefined') return STATIC_DEFAULTS
  return {
    ...STATIC_DEFAULTS,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  }
}

export const ABSOLUTE_UNIT_CONVERSIONS: Record<string, number> = {
  px: 1,
  in: 96,
  cm: 37.8,
  mm: 3.78,
  pt: 1.33,
  pc: 16,
}

export const RELATIVE_UNITS: string[] = ['em', 'rem', 'vh', 'vw', 'vmin', 'vmax', '%']

const RELATIVE_UNIT_RESOLVERS: Record<string, (ctx: Required<ConversionContext>) => number> = {
  em: (ctx) => ctx.parentFontSize,
  rem: (ctx) => ctx.rootFontSize,
  vh: (ctx) => ctx.viewportHeight / 100,
  vw: (ctx) => ctx.viewportWidth / 100,
  vmin: (ctx) => Math.min(ctx.viewportWidth, ctx.viewportHeight) / 100,
  vmax: (ctx) => Math.max(ctx.viewportWidth, ctx.viewportHeight) / 100,
  '%': (ctx) => ctx.parentSize / 100,
}

export function convertValue(
  value: number | string | undefined,
  context?: ConversionContext
): number | null {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return null

  const parsed = parseUnit(value)
  if (!parsed) return null

  const { value: num, unit } = parsed

  if (unit in ABSOLUTE_UNIT_CONVERSIONS) {
    return num * ABSOLUTE_UNIT_CONVERSIONS[unit]
  }

  if (unit === 'auto') return null

  const resolver = RELATIVE_UNIT_RESOLVERS[unit]
  if (resolver) {
    const ctx = { ...getDefaultContext(), ...context }
    return num * resolver(ctx)
  }

  return null
}
