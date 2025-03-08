/**
 * @file validation.ts
 * @description Validation utilities for Guide component configurations
 * @module baseline-kit/components/Guide/validation
 */

import {
  GRID_ALIGNMENTS,
  GridAlignment,
  GuideColumnsPattern,
  GuideColumnValue,
  GuideConfig,
} from '@components'
import { ABSOLUTE_UNIT_CONVERSIONS, RELATIVE_UNITS } from '@utils'

/**
 * Regular expression for valid CSS unit values.
 * Matches numeric values with supported CSS units.
 */
const UNIT_PATTERN =
  /^\d*\.?\d+(?:fr|px|%|em|rem|vh|vw|vmin|vmax|pt|pc|in|cm|mm)$/

/**
 * Validates individual grid column values.
 *
 * @example
 * ```ts
 * isValidGuideColumnValue(100)     // true
 * isValidGuideColumnValue('100px') // true
 * isValidGuideColumnValue('auto')  // true
 * isValidGuideColumnValue('foo')   // false
 * ```
 */
export const isValidGuideColumnValue = (
  value: unknown
): value is GuideColumnValue => {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0
  if (typeof value !== 'string') return false
  return value === 'auto' || value === '100%' || UNIT_PATTERN.test(value)
}

/**
 * Validates an array of column values as a grid pattern.
 *
 * @example
 * ```ts
 * isValidGuidePattern(['100px', '1fr'])     // true
 * isValidGuidePattern([100, 200])           // true
 * isValidGuidePattern(['invalid'])          // false
 * isValidGuidePattern([])                   // false
 * ```
 */
export const isValidGuidePattern = (
  pattern: unknown
): pattern is GuideColumnsPattern =>
  Array.isArray(pattern) &&
  pattern.length > 0 &&
  pattern.every(isValidGuideColumnValue)

/**
 * Validates CSS grid values against supported units.
 *
 * @example
 * ```ts
 * isGuideValue('100px')   // true
 * isGuideValue('2rem')    // true
 * isGuideValue('foo')     // false
 * ```
 */
export const isGuideValue = (value: unknown) => {
  const CSS_UNITS = [
    ...Object.keys(ABSOLUTE_UNIT_CONVERSIONS),
    ...RELATIVE_UNITS,
  ]
  return (
    typeof value === 'number' ||
    (typeof value === 'string' &&
      CSS_UNITS.some((unit) => value.endsWith(unit)))
  )
}

/**
 * Validates grid alignment values.
 *
 * @example
 * ```ts
 * isGuideAlignment('start')   // true
 * isGuideAlignment('center')  // true
 * isGuideAlignment('foo')     // false
 * ```
 */
export const isGuideAlignment = (value: unknown): value is GridAlignment =>
  typeof value === 'string' && GRID_ALIGNMENTS.includes(value as GridAlignment)

/**
 * Type guard for object values.
 */
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/**
 * Validates line-based guide configurations.
 *
 * @example
 * ```ts
 * isGuideLineConfig({ variant: 'line' })           // true
 * isGuideLineConfig({ variant: 'pattern' })        // false
 * ```
 */
export const isGuideLineConfig = (config: unknown): config is GuideConfig =>
  isObject(config) && config.variant === 'line'

/**
 * Validates column-based guide configurations.
 *
 * @example
 * ```ts
 * isGuideColumnConfig({ columns: 12 })             // true
 * isGuideColumnConfig({ variant: 'line' })         // false
 * ```
 */
export const isGuideColumnConfig = (config: unknown): config is GuideConfig =>
  isObject(config) && 'columns' in config && !('variant' in config)

/**
 * Validates auto-calculated guide configurations.
 *
 * @example
 * ```ts
 * isAutoCalculatedGuide({ columnWidth: '200px' })  // true
 * isAutoCalculatedGuide({ columns: 12 })           // false
 * ```
 */
export const isAutoCalculatedGuide = (config: unknown): config is GuideConfig =>
  isObject(config) &&
  'columnWidth' in config &&
  !('variant' in config) &&
  !('columns' in config)
