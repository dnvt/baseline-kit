import { convertValue } from './convert'

export function moduloize(
  value: number | string | undefined,
  base: number,
  options?: { round?: boolean }
): string {
  const doRound = options?.round ?? true
  const num =
    value === undefined
      ? 0
      : typeof value === 'number'
        ? value
        : (convertValue(value) ?? 0)
  const normalized = doRound ? Math.round(num) : num
  const remainder = normalized % base
  return `${remainder}px`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function round(value: number, precision = 0): number {
  if (precision >= 0) {
    return Number(
      (Math.round(value * 10 ** precision) / 10 ** precision).toFixed(precision)
    )
  } else {
    const factor = 10 ** Math.abs(precision)
    return Math.round(value / factor) * factor
  }
}

type RowCountParams = {
  height?: number
  top: number
  bottom: number
  base: number
}

export function calculateRowCount(params: RowCountParams): number {
  const { height, top, bottom, base } = params
  const totalHeight = (height ?? 0) - (top + bottom)
  return Math.max(1, Math.floor(totalHeight / base))
}
