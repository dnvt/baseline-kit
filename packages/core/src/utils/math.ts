export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
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
