/**
 * Parses a CSS unit string into its numeric value and unit.
 *
 * @param value - CSS value string to parse
 * @returns Object with value and unit, or null if parsing fails
 */
export function parseUnit(
  value: string
): { value: number; unit: string } | null {
  const match = value.trim().match(/^([+-]?[\d.]+)([a-zA-Z%]+)$/)
  if (!match) return null
  const num = parseFloat(match[1])
  const unit = match[2]
  return { value: num, unit }
}

/**
 * Formats a value as a valid CSS string.
 *
 * @param value - Value to format
 * @param defaultValue - Optional default if value is undefined
 * @returns Formatted CSS string
 */
export function formatValue(
  value: string | number | undefined,
  defaultValue?: number
): string {
  if (value === undefined && defaultValue !== undefined)
    return `${defaultValue}px`
  if (
    value === 'auto' ||
    (typeof value === 'string' &&
      /^(auto|100%|0|.*(fr|vh|vw|vmin|vmax|rem))$/.test(value))
  ) {
    return String(value)
  }
  if (typeof value === 'number') return `${value}px`
  return value ?? ''
}
