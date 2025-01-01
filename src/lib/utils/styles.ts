import type { CSSCustomProperties, CSSPixelValue, CSSValue } from '@types'
import { CSSProperties } from 'react'

// Combining classnames
export const cx = (
  ...classes: Array<string | boolean | undefined | null>
): string => classes.filter(Boolean).join(' ').trim()

// Combining styles
export const cs = <
  T extends Partial<CSSProperties & CSSCustomProperties>,
>(
    ...styles: Array<T | undefined>
  ): T =>
    styles
      .filter((style): style is T => style !== undefined)
      .reduce((acc, style) => ({ ...acc, ...style }), {} as T)

export const parseCSSValue = (
  value: CSSValue | '100%' | 'auto',
): string => {
  if (value === 'auto' || value === '100%') return value
  return typeof value === 'number' ? `${value}px` : value.toString()
}


export const extractCSSNumber = (value: CSSPixelValue): number => {
  // If value is already a number, return it
  if (typeof value === 'number') return value

  // Try to parse the numeric portion
  const numericMatch = value.toString().match(/^-?\d*\.?\d+/)
  return numericMatch ? parseFloat(numericMatch[0]) : 0
}
