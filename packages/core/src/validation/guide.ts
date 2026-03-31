import type { GuideColumnsPattern, GuideColumnValue } from '../types'

const UNIT_PATTERN =
  /^\d*\.?\d+(?:fr|px|%|em|rem|vh|vw|vmin|vmax|pt|pc|in|cm|mm)$/

export const isValidGuideColumnValue = (
  value: unknown
): value is GuideColumnValue => {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0
  if (typeof value !== 'string') return false
  return value === 'auto' || value === '100%' || UNIT_PATTERN.test(value)
}

export const isValidGuidePattern = (
  pattern: unknown
): pattern is GuideColumnsPattern =>
  Array.isArray(pattern) &&
  pattern.length > 0 &&
  pattern.every(isValidGuideColumnValue)
