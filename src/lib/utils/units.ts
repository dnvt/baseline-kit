import { CSSValue, CSS_UNITS, RELATIVE_UNITS } from '@types'

interface CSSUnitConversion {
  value: number
  unit: string
}

interface CSSValueParser {
  (value: string): CSSUnitConversion | null
}

/**
 * Standard CSS unit conversion rates to pixels
 */
export const CSS_UNIT_CONVERSIONS = {
  'px': 1,      // Base unit
  'in': 96,     // 1in = 96px
  'cm': 37.8,   // 1cm = 37.8px
  'mm': 3.78,   // 1mm = 3.78px
  'pt': 1.33,   // 1pt = 1.33px
  'pc': 16,     // 1pc = 16px
} as const

/**
 * Parses a CSS value string into its numeric value and unit parts
 */
export const parseCSSUnit: CSSValueParser = (value: string) => {
  const match = value.match(/^([\d.]+)([a-z%]+)$/)
  if (!match) return null

  const [, num, unit] = match
  return {
    value: parseFloat(num),
    unit,
  }
}

/**
 * Checks if a value uses a relative CSS unit
 */
export const isRelativeUnit = (value: string): boolean =>
  RELATIVE_UNITS.some(unit => value.endsWith(unit))

/**
 * Checks if a value uses an absolute CSS unit
 */
export const isAbsoluteUnit = (value: string): boolean =>
  !isRelativeUnit(value) && CSS_UNITS.some(unit => value.endsWith(unit))

/**
 * Converts a CSS value to its pixel equivalent
 */
export const convertToPixels = (value: string): number => {
  const parsed = parseCSSUnit(value)
  if (!parsed) return 0

  const conversion = CSS_UNIT_CONVERSIONS[parsed.unit as keyof typeof CSS_UNIT_CONVERSIONS]
  return parsed.value * (conversion || 1)
}

/**
 * Formats a CSS value into a valid CSS string
 */
export const formatCSSValue = (
  value: CSSValue | '100%' | 'auto' | undefined,
  defaultValue?: number,
): string => {
  if (!value && defaultValue !== undefined) {
    return `${defaultValue}px`
  }

  if (value === 'auto' || value === '100%') {
    return value
  }

  return typeof value === 'number' ? `${value}px` : value?.toString() || '0'
}