import { parseUnit } from './parse'

export interface ConversionContext {
  parentSize?: number
  viewportWidth?: number
  viewportHeight?: number
  rootFontSize?: number
  parentFontSize?: number
}

const DEFAULT_CONTEXT: Required<ConversionContext> = {
  parentSize: 0,
  viewportWidth: 1920,
  viewportHeight: 1080,
  rootFontSize: 16,
  parentFontSize: 16,
}

export const ABSOLUTE_UNIT_CONVERSIONS: Record<string, number> = {
  px: 1,
  in: 96,
  cm: 37.8,
  mm: 3.78,
  pt: 1.33,
  pc: 16,
}

type UnitResolver = (ctx: Required<ConversionContext>) => number

// Viewport units (inline and block as in horizontal writing). Their small,
// large and dynamic forms (svh, lvh, dvh, ...) resolve to the current
// viewport.
const VIEWPORT_UNITS: Record<string, UnitResolver> = {
  vw: (ctx) => ctx.viewportWidth / 100,
  vh: (ctx) => ctx.viewportHeight / 100,
  vi: (ctx) => ctx.viewportWidth / 100,
  vb: (ctx) => ctx.viewportHeight / 100,
  vmin: (ctx) => Math.min(ctx.viewportWidth, ctx.viewportHeight) / 100,
  vmax: (ctx) => Math.max(ctx.viewportWidth, ctx.viewportHeight) / 100,
}

const RELATIVE_UNIT_RESOLVERS: Record<string, UnitResolver> = {
  em: (ctx) => ctx.parentFontSize,
  rem: (ctx) => ctx.rootFontSize,
  ...Object.fromEntries(
    Object.entries(VIEWPORT_UNITS).flatMap(([unit, resolve]) =>
      ['', 's', 'l', 'd'].map((prefix) => [`${prefix}${unit}`, resolve])
    )
  ),
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

  // CSS units are case-insensitive.
  const num = parsed.value
  const unit = parsed.unit.toLowerCase()

  if (unit in ABSOLUTE_UNIT_CONVERSIONS) {
    return num * ABSOLUTE_UNIT_CONVERSIONS[unit]
  }

  if (unit === 'auto') return null

  const resolver = RELATIVE_UNIT_RESOLVERS[unit]
  if (resolver) {
    const ctx = { ...DEFAULT_CONTEXT, ...context }
    return num * resolver(ctx)
  }

  return null
}
