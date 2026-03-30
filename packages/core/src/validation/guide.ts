import type { GuideColumnsPattern, GuideColumnValue, GridAlignment, GuideConfig } from '../types'
import { GRID_ALIGNMENTS, ABSOLUTE_UNIT_CONVERSIONS, RELATIVE_UNITS } from '..'

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

const CSS_UNITS = [
  ...Object.keys(ABSOLUTE_UNIT_CONVERSIONS),
  ...RELATIVE_UNITS,
]

export const isGuideValue = (value: unknown) =>
  typeof value === 'number' ||
  (typeof value === 'string' &&
    CSS_UNITS.some((unit) => value.endsWith(unit)))

export const isGuideAlignment = (value: unknown): value is GridAlignment =>
  typeof value === 'string' && GRID_ALIGNMENTS.includes(value as GridAlignment)

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const isGuideLineConfig = (config: unknown): config is GuideConfig =>
  isObject(config) && config.variant === 'line'

export const isGuideColumnConfig = (config: unknown): config is GuideConfig =>
  isObject(config) && 'columns' in config && !('variant' in config)

export const isAutoCalculatedGuide = (config: unknown): config is GuideConfig =>
  isObject(config) &&
  'columnWidth' in config &&
  !('variant' in config) &&
  !('columns' in config)
