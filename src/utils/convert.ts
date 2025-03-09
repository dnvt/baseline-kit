import { parseUnit } from './parse'

export interface ConversionContext {
  /** Parent element dimension for relative units */
  parentSize?: number
  /** Viewport width for vw units */
  viewportWidth?: number
  /** Viewport height for vh units */
  viewportHeight?: number
  /** Root font size for rem units */
  rootFontSize?: number
  /** Parent font size for em units */
  parentFontSize?: number
}

const DEFAULT_CONTEXT: Required<ConversionContext> = {
  parentSize: 0,
  viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
  viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
  rootFontSize: 16,
  parentFontSize: 16,
}

/** Conversion factors for absolute units to pixels */
export const ABSOLUTE_UNIT_CONVERSIONS: Record<string, number> = {
  px: 1,
  in: 96, // 1in = 96px
  cm: 37.8, // 1cm = 37.8px
  mm: 3.78, // 1mm = 3.78px
  pt: 1.33, // 1pt = 1.33px
  pc: 16, // 1pc = 16px
}

/** Supported relative CSS units */
export const RELATIVE_UNITS: string[] = [
  'em',
  'rem',
  'vh',
  'vw',
  'vmin',
  'vmax',
  '%',
]

/**
 * Converts CSS values to pixels.
 *
 * @param value - CSS value to convert
 * @param context - Optional context for relative unit conversion
 * @returns Value in pixels or null if conversion fails
 */
export function convertValue(
  value: number | string | undefined,
  context?: ConversionContext
): number | null {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return null

  const parsed = parseUnit(value)
  if (!parsed) return null

  const { value: num, unit } = parsed

  // Handle absolute units
  if (unit in ABSOLUTE_UNIT_CONVERSIONS) {
    return num * ABSOLUTE_UNIT_CONVERSIONS[unit]
  }

  // Special case for auto
  if (unit === 'auto') return null

  // Handle relative units
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
