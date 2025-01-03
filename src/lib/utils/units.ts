import { CSSValue } from '@types'

// Expand CSS unit conversions
export const CSS_UNIT_CONVERSIONS = {
  // Absolute units
  'px': 1,      // Base unit
  'in': 96,     // 1in = 96px
  'cm': 37.8,   // 1cm = 37.8px
  'mm': 3.78,   // 1mm = 3.78px
  'pt': 1.33,   // 1pt = 1.33px
  'pc': 16,     // 1pc = 16px

  // Relative units (assuming a base context)
  'em': 16,     // Relative to parent font size (default 16px)
  'rem': 16,    // Relative to root font size (default 16px)
  'vh': null,   // Viewport height (calculated at runtime)
  'vw': null,   // Viewport width (calculated at runtime)
  'vmin': null, // Minimum of vh and vw
  'vmax': null, // Maximum of vh and vw
  '%': null,    // Percentage (calculated based on parent)
  'fr': null,   // Fraction (grid-specific)
} as const

// Enhanced unit parsing
export const parseCSSUnit = (value: string) => {
  const match = value.match(/^([+-]?[\d.]+)([a-z%]+)$/)
  if (!match) return null

  const [, num, unit] = match
  return {
    value: parseFloat(num),
    unit,
  }
}

// Enhanced conversion with context
interface ConversionContext {
  parentSize?: number
  viewportWidth?: number
  viewportHeight?: number
  rootFontSize?: number
  parentFontSize?: number
}

export const convertToPixels = (
  value: string,
  context: ConversionContext = {},
): number | null => {
  const parsed = parseCSSUnit(value)
  if (!parsed) return null

  const {
    parentSize = 0,
    viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0,
    viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0,
    rootFontSize = 16,
    parentFontSize = 16,
  } = context

  switch (parsed.unit) {
  // Absolute units
  case 'px':
    return parsed.value
  case 'in':
    return parsed.value * 96
  case 'cm':
    return parsed.value * 37.8
  case 'mm':
    return parsed.value * 3.78
  case 'pt':
    return parsed.value * 1.33
  case 'pc':
    return parsed.value * 16

    // Relative units
  case 'em':
    return parsed.value * parentFontSize
  case 'rem':
    return parsed.value * rootFontSize
  case 'vh':
    return (parsed.value / 100) * viewportHeight
  case 'vw':
    return (parsed.value / 100) * viewportWidth
  case 'vmin':
    return (parsed.value / 100) * Math.min(viewportWidth, viewportHeight)
  case 'vmax':
    return (parsed.value / 100) * Math.max(viewportWidth, viewportHeight)
  case '%':
    return (parsed.value / 100) * parentSize

    // Grid-specific units
  case 'fr':
    return null // fr units can't be converted to pixels

  default:
    return null
  }
}

// Enhanced CSS value formatting
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

  if (typeof value === 'number') {
    return `${value}px`
  }

  // Handle special grid units
  if (typeof value === 'string') {
    const parsed = parseCSSUnit(value)
    if (parsed && parsed.unit === 'fr') {
      return value // Keep fr units as-is
    }
  }

  return value?.toString() || '0'
}

// New utility functions
export const isGridUnit = (value: string): boolean => {
  const parsed = parseCSSUnit(value)
  return parsed !== null && (parsed.unit === 'fr' || parsed.unit === '%')
}

export const isAbsoluteUnit = (value: string): boolean => {
  const parsed = parseCSSUnit(value)
  return parsed !== null && ['px', 'in', 'cm', 'mm', 'pt', 'pc'].includes(parsed.unit)
}

export const isRelativeUnit = (value: string): boolean => {
  const parsed = parseCSSUnit(value)
  return parsed !== null && ['em', 'rem', 'vh', 'vw', 'vmin', 'vmax', '%'].includes(parsed.unit)
}

export const normalizeGridUnit = (
  value: string,
  context: ConversionContext = {},
): string => {
  const pixels = convertToPixels(value, context)
  if (pixels !== null) {
    return `${pixels}px`
  }
  return value // Keep original value if conversion not possible
}
