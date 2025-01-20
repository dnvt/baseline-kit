import { GRID_ALIGNMENTS, GridAlignment, GuideColumnsPattern, GuideColumnValue, GuideConfig } from '@components'
import { CSS_UNITS, CSSValue } from '@utils'

const UNIT_PATTERN = /^\d*\.?\d+(?:fr|px|%|em|rem|vh|vw|vmin|vmax|pt|pc|in|cm|mm)$/

/**
 * Validates if the given value is a valid grid column value.
 *
 * @param value - The value to validate.
 * @returns `true` if the value is a valid grid column value, otherwise `false`.
 */
export const isValidGuideColumnValue = (value: unknown): value is GuideColumnValue => {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0
  if (typeof value !== 'string') return false
  return value === 'auto' || value === '100%' || UNIT_PATTERN.test(value)
}

/**
 * Validates if the given pattern is a valid grid column pattern.
 *
 * @param pattern - The pattern to validate.
 * @returns `true` if the pattern is a valid grid column pattern, otherwise `false`.
 */
export const isValidGuidePattern = (pattern: unknown): pattern is GuideColumnsPattern =>
  Array.isArray(pattern) && pattern.length > 0 && pattern.every(isValidGuideColumnValue)

/**
 * Validates if the given value is a valid CSS grid value.
 *
 * @param value - The value to validate.
 * @returns `true` if the value is a valid CSS grid value, otherwise `false`.
 */
export const isGuideValue = (value: unknown): value is CSSValue =>
  typeof value === 'number' ||
  (typeof value === 'string' && CSS_UNITS.some(unit => value.endsWith(unit)))

/**
 * Validates if the given value is a valid grid alignment.
 *
 * @param value - The value to validate.
 * @returns `true` if the value is a valid grid alignment, otherwise `false`.
 */
export const isGuideAlignment = (value: unknown): value is GridAlignment =>
  typeof value === 'string' && GRID_ALIGNMENTS.includes(value as GridAlignment)

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/**
 * Validates if the given configuration is a valid grid line configuration.
 *
 * @param config - The configuration to validate.
 * @returns `true` if the configuration is a valid grid line configuration, otherwise `false`.
 */
export const isGuideLineConfig = (config: unknown): config is GuideConfig =>
  isObject(config) && config.variant === 'line'

/**
 * Validates if the given configuration is a valid grid column configuration.
 *
 * @param config - The configuration to validate.
 * @returns `true` if the configuration is a valid grid column configuration, otherwise `false`.
 */
export const isGuideColumnConfig = (config: unknown): config is GuideConfig =>
  isObject(config) && 'columns' in config && !('variant' in config)

/**
 * Validates if the given configuration is a valid auto-calculated grid configuration.
 *
 * @param config - The configuration to validate.
 * @returns `true` if the configuration is a valid auto-calculated grid configuration, otherwise `false`.
 */
export const isAutoCalculatedGuide = (config: unknown): config is GuideConfig =>
  isObject(config) &&
  'columnWidth' in config &&
  !('variant' in config) &&
  !('columns' in config)