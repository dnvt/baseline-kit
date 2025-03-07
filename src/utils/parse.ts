/**
 * Parses a CSS unit string into its numeric value and unit.
 *
 * @remarks
 * Handles:
 * - Integer and decimal values
 * - All CSS units (px, em, rem, etc.)
 * - Percentage values
 * - Sign prefixes (+ and -)
 *
 * @param value - CSS value string to parse
 * @returns Object with value and unit, or null if parsing fails
 *
 * @example
 * ```ts
 * parseUnit('100px')    // => { value: 100, unit: 'px' }
 * parseUnit('1.5rem')   // => { value: 1.5, unit: 'rem' }
 * parseUnit('-20%')     // => { value: -20, unit: '%' }
 * parseUnit('invalid')  // => null
 * ```
 */
export function parseUnit(value: string): { value: number; unit: string } | null {
  const match = value.trim().match(/^([+-]?[\d.]+)([a-zA-Z%]+)$/)
  if (!match) return null
  const num = parseFloat(match[1])
  const unit = match[2]
  return { value: num, unit }
}

/**
 * Formats a value as a valid CSS string.
 *
 * @remarks
 * Handles:
 * - Numbers (adds px suffix)
 * - Special values (auto, 100%, etc.)
 * - Undefined values with defaults
 *
 * @param value - Value to format
 * @param defaultValue - Optional default if value is undefined
 * @returns Formatted CSS string
 *
 * @example
 * ```ts
 * formatValue(14)             // => "14px"
 * formatValue('auto')         // => "auto"
 * formatValue(undefined, 10)  // => "10px"
 * formatValue('1fr')         // => "1fr"
 * ```
 */
export function formatValue(value: string | number | undefined, defaultValue?: number): string {
  if (value === undefined && defaultValue !== undefined) return `${defaultValue}px`
  if (value === 'auto' || (typeof value === 'string' && (/^(auto|100%|0|.*(fr|vh|vw|vmin|vmax|rem))$/).test(value))) {
    return String(value)
  }
  if (typeof value === 'number') return `${value}px`
  return value ?? ''
}