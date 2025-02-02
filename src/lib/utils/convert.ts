import { CSSValue, parseUnit } from './index'

export interface ConversionContext {
  parentSize?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  rootFontSize?: number;
  parentFontSize?: number;
}

const DEFAULT_CONTEXT: Required<ConversionContext> = {
  parentSize: 0,
  viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
  viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
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

export const RELATIVE_UNITS: string[] = ['em', 'rem', 'vh', 'vw', 'vmin', 'vmax', '%']


/**
 * Converts a CSSValue to a pixel number.
 * @param value - A numeric value or a string (e.g. "100px", "1em", etc.)
 * @param context - Optional conversion context for relative units.
 * @returns The numeric pixel value, or null if conversion fails.
 */
export function convertValue(value: CSSValue, context?: ConversionContext): number | null {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return null
  const parsed = parseUnit(value)
  if (!parsed) return null
  const { value: num, unit } = parsed
  if (unit in ABSOLUTE_UNIT_CONVERSIONS) {
    return num * ABSOLUTE_UNIT_CONVERSIONS[unit]
  }
  if (unit === 'auto') {
    // Treat "auto" as a special case (downstream code can decide how to handle it).
    return null
  }
  if (RELATIVE_UNITS.includes(unit)) {
    const ctx = { ...DEFAULT_CONTEXT, ...context }
    switch (unit) {
    case 'em':
      return num * ctx.parentFontSize
    case 'rem':
      return num * ctx.rootFontSize
    case 'vh':
      return (num / 100) * ctx.viewportHeight
    case 'vw':
      return (num / 100) * ctx.viewportWidth
    case 'vmin':
      return (num / 100) * Math.min(ctx.viewportWidth, ctx.viewportHeight)
    case 'vmax':
      return (num / 100) * Math.max(ctx.viewportWidth, ctx.viewportHeight)
    case '%':
      return (num / 100) * ctx.parentSize
    default:
      return null
    }
  }
  return null
}