import { CSSValue } from './index'

/**
 * Parses a CSS unit string into its numeric value and unit.
 * @param value - A string like "100px", "1.5rem", etc.
 * @returns An object { value, unit } or null if parsing fails.
 */
export function parseUnit(value: string): { value: number; unit: string } | null {
  const match = value.trim().match(/^([+-]?[\d.]+)([a-zA-Z%]+)$/)
  if (!match) return null
  const num = parseFloat(match[1])
  const unit = match[2]
  return { value: num, unit }
}

/**
 * Formats a CSSValue as a valid CSS string.
 * Numeric values are suffixed with "px" (unless the value is zero).
 * Certain special strings (like "auto", "100%", "1fr", etc.) are returned as is.
 *
 * @param value - The CSS value to format.
 * @param defaultValue - An optional default numeric value if value is undefined.
 * @returns A formatted CSS string.
 */
export function formatValue(value: CSSValue | undefined, defaultValue?: number): string {
  if (value === undefined && defaultValue !== undefined) return `${defaultValue}px`
  if (value === 'auto' || (typeof value === 'string' && (/^(auto|100%|0|.*(fr|vh|vw|vmin|vmax|rem))$/).test(value))) {
    return String(value)
  }
  if (typeof value === 'number') return `${value}px`
  return value ?? ''
}