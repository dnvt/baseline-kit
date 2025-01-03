import type { CSSValue } from '@types'
import { CSSProperties } from 'react'
import { convertToPixels, isGridUnit, isRelativeUnit, parseCSSUnit } from './units'

/**
 * Combines class names, filtering out falsy values
 */
export const cx = (
  ...classes: Array<string | boolean | undefined | null>
): string => classes.filter(Boolean).join(' ').trim()

/**
 * Combines style objects, ensuring type safety
 */
export const cs = <T extends CSSProperties>(
  ...styles: Array<T | undefined>
): T =>
    styles
      .filter((style): style is T => style !== undefined)
      .reduce((acc, style) => ({ ...acc, ...style }), {} as T)

/**
 * Parses a CSS value into a valid CSS string
 */
export const parseCSSValue = (
  value: CSSValue | undefined,
): string => {
  if (!value) return '0'
  if (value === 'auto') return value

  if (typeof value === 'number') {
    return `${value}px`
  }

  // Handle units
  const parsed = parseCSSUnit(value)
  if (parsed) {
    // Keep relative and grid units as-is
    if (isRelativeUnit(value) || isGridUnit(value)) {
      return value
    }
    // Convert absolute units to pixels
    const pixels = convertToPixels(value)
    if (pixels !== null) {
      return `${pixels}px`
    }
  }

  return value.toString()
}

/**
 * Extracts numeric value from CSS pixel values
 */
export const extractCSSNumber = (value: CSSValue): number => {
  if (value === 'auto') return 0
  if (typeof value === 'number') return value

  // Try to convert to pixels first
  const pixels = convertToPixels(value)
  if (pixels !== null) return pixels

  // Fallback to extracting just the number
  const numericMatch = value.toString().match(/^-?\d*\.?\d+/)
  return numericMatch ? parseFloat(numericMatch[0]) : 0
}
