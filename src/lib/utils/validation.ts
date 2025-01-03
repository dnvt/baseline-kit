import {
  CSSValue,
  GridAlignment,
  GridColumnValue,
  GridColumnsPattern,
  GridConfig,
  CSS_UNITS,
} from '@types'
import { GRID_ALIGNMENTS } from '@types'

/**
 * Validates if the given value is a valid grid column value.
 *
 * @param value - The value to validate.
 * @returns `true` if the value is a valid grid column value, otherwise `false`.
 */
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

/**
 * Validates if the given pattern is a valid grid column pattern.
 *
 * @param pattern - The pattern to validate.
 * @returns `true` if the pattern is a valid grid column pattern, otherwise `false`.
 */
export const isValidGridPattern = (
  pattern: unknown,
): pattern is GridColumnsPattern => {
  return Array.isArray(pattern) && pattern.length > 0 && pattern.every(isValidGridColumnValue)
}

/**
 * Validates if the given value is a valid CSS grid value.
 *
 * @param value - The value to validate.
 * @returns `true` if the value is a valid CSS grid value, otherwise `false`.
 */
export const isGridValue = (value: unknown): value is CSSValue => {
  if (typeof value === 'number') return true
  return (
    typeof value === 'string' && CSS_UNITS.some((unit) => value.endsWith(unit))
  )
}

/**
 * Validates if the given value is a valid grid alignment.
 *
 * @param value - The value to validate.
 * @returns `true` if the value is a valid grid alignment, otherwise `false`.
 */
export const isGridAlignment = (value: unknown): value is GridAlignment =>
  typeof value === 'string' && GRID_ALIGNMENTS.includes(value as GridAlignment)

/**
 * Validates if the given configuration is a valid grid line configuration.
 *
 * @param config - The configuration to validate.
 * @returns `true` if the configuration is a valid grid line configuration, otherwise `false`.
 */
export const isGridLineConfig = (config: unknown): config is GridConfig => {
  return (
    typeof config === 'object' &&
    config !== null &&
    'variant' in config &&
    config.variant === 'line'
  )
}

/**
 * Validates if the given configuration is a valid grid column configuration.
 *
 * @param config - The configuration to validate.
 * @returns `true` if the configuration is a valid grid column configuration, otherwise `false`.
 */
export const isGridColumnConfig = (config: unknown): config is GridConfig => {
  return (
    typeof config === 'object' &&
    config !== null &&
    'columns' in config &&
    !('variant' in config)
  )
}

/**
 * Validates if the given configuration is a valid auto-calculated grid configuration.
 *
 * @param config - The configuration to validate.
 * @returns `true` if the configuration is a valid auto-calculated grid configuration, otherwise `false`.
 */
export const isAutoCalculatedGrid = (config: unknown): config is GridConfig => {
  return (
    typeof config === 'object' &&
    config !== null &&
    'columnWidth' in config &&
    !('variant' in config) &&
    !('columns' in config)
  )
}