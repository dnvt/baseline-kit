export function parseUnit(value: string): { value: number; unit: string } | null {
  const match = value.trim().match(/^([+-]?[\d.]+)([a-zA-Z%]+)$/)
  if (!match) return null
  const num = parseFloat(match[1])
  const unit = match[2]
  return { value: num, unit }
}

export function formatValue(value: string | number | undefined, defaultValue?: number): string {
  if (value === undefined && defaultValue !== undefined) return `${defaultValue}px`
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
