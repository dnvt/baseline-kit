import {
  CSSValue,
  GridAlignment,
  GridColumnValue,
  GridColumnsPattern,
  GridConfig,
  CSS_UNITS,
} from '@types'
import { GRID_ALIGNMENTS } from '@types'

export const isValidGridColumnValue = (
  value: unknown,
): value is GridColumnValue => {
  // Handle numeric values with proper validation
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 // Only allow finite, non-negative numbers
  }

  if (typeof value !== 'string') return false

  // Handle special values
  if (value === 'auto' || value === '100%') return true

  // Handle all valid CSS units with improved regex to support decimals
  const unitPattern = /^(?:\d*\.?\d+)(?:fr|px|%|em|rem|vh|vw|vmin|vmax|pt|pc|in|cm|mm)$/
  return unitPattern.test(value)
}

export const isValidGridPattern = (
  pattern: unknown,
): pattern is GridColumnsPattern => {
  return Array.isArray(pattern) && pattern.length > 0 && pattern.every(isValidGridColumnValue)
}

export const isGridValue = (value: unknown): value is CSSValue => {
  if (typeof value === 'number') return true
  return (
    typeof value === 'string' && CSS_UNITS.some((unit) => value.endsWith(unit))
  )
}

export const isGridAlignment = (value: unknown): value is GridAlignment =>
  typeof value === 'string' && GRID_ALIGNMENTS.includes(value as GridAlignment)

export const isGridLineConfig = (config: unknown): config is GridConfig => {
  return (
    typeof config === 'object' &&
    config !== null &&
    'variant' in config &&
    config.variant === 'line'
  )
}

export const isGridColumnConfig = (config: unknown): config is GridConfig => {
  return (
    typeof config === 'object' &&
    config !== null &&
    'columns' in config &&
    !('variant' in config)
  )
}

export const isAutoCalculatedGrid = (config: unknown): config is GridConfig => {
  return (
    typeof config === 'object' &&
    config !== null &&
    'columnWidth' in config &&
    !('variant' in config) &&
    !('columns' in config)
  )
}