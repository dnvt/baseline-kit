import type { CSSValue } from '@types'
import { CSSProperties } from 'react'
import { convertToPixels, isGridUnit, isRelativeUnit, parseCSSUnit } from './units'

/**
 * Combines class names, filtering out falsy values.
 * Useful for conditionally applying class names in React components.
 *
 * @param classes - An array of class names or falsy values (e.g., `null`, `undefined`, `false`).
 * @returns A single string of class names, separated by spaces.
 */
export const cx = (
  ...classes: Array<string | boolean | undefined | null>
): string => classes.filter(Boolean).join(' ').trim()

/**
 * Combines multiple style objects into one, ensuring type safety.
 * Useful for dynamically applying styles in React components.
 *
 * @param styles - An array of style objects or `undefined`.
 * @returns A single combined style object.
 */
export const cs = <T extends CSSProperties>(
  ...styles: Array<T | undefined>
): T =>
    styles
      .filter((style): style is T => style !== undefined)
      .reduce((acc, style) => ({ ...acc, ...style }), {} as T)

/**
 * Parses a CSS value into a valid CSS string.
 * Handles numeric values, relative units, grid units, and absolute units.
 *
 * @param value - The CSS value to parse (e.g., `px`, `em`, `rem`, `auto`, or a number).
 * @returns A valid CSS string (e.g., `10px`, `auto`, `1em`).
 */
export const parseCSSValue = (
  value: CSSValue | undefined,
): string => {
  if (!value) return '0'
  if (value === 'auto') return value
  if (typeof value === 'number') return `${value}px`

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

  // Fallback: Return the value as a string
  return value.toString()
}

/**
 * Extracts the numeric value from a CSS value.
 * Converts relative and absolute units to pixels where possible.
 *
 * @param value - The CSS value to extract the number from (e.g., `10px`, `1em`, `auto`).
 * @returns The numeric value as a number, or `0` if the value cannot be parsed.
 */
export const extractCSSNumber = (value: CSSValue): number => {
  if (value === 'auto') return 0
  if (typeof value === 'number') return value

  // Try to convert to pixels first
  const pixels = convertToPixels(value)
  if (pixels !== null) return pixels

  // Fallback: Extract numeric part of the value
  const numericMatch = value.toString().match(/^-?\d*\.?\d+/)
  return numericMatch ? parseFloat(numericMatch[0]) : 0
}
