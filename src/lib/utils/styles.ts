import type { CSSPixelValue, CSSValue } from '@types'
import { CSSProperties } from 'react'
import { formatCSSValue } from './units'

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
  value: CSSValue | '100%' | 'auto',
): string => formatCSSValue(value)

/**
 * Extracts numeric value from CSS pixel values
 */
export const extractCSSNumber = (value: CSSPixelValue): number => {
  if (typeof value === 'number') return value

  const numericMatch = value.toString().match(/^-?\d*\.?\d+/)
  return numericMatch ? parseFloat(numericMatch[0]) : 0
}