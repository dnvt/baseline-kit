import type {
  CSSValue,
  GridAlignment,
  GridColumnValue,
  GridColumnsPattern,
  GridConfig,
} from '@types'
import { GRID_ALIGNMENTS } from '@types'
import { CSS_UNITS } from './constants'

export const isValidGridColumnValue = (
  value: unknown,
): value is GridColumnValue => {
  if (typeof value === 'number') return true
  if (typeof value !== 'string') return false

  if (value === 'auto') return true
  if (/^\d+fr$/.test(value)) return true
  return CSS_UNITS.some((unit) => value.endsWith(unit))
}

export const isValidGridPattern = (
  pattern: unknown,
): pattern is GridColumnsPattern => {
  return Array.isArray(pattern) && pattern.every(isValidGridColumnValue)
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