import type { PGConfig } from '@components'
import {
  type BreakpointKey,
  type CSSValue,
  type GridAlignment,
  type GridColumnValue,
  type GridColumnsPattern, type GridConfig,
} from '@types'
import { BREAKPOINTS, GRID_ALIGNMENTS } from '@types'

import { CSS_UNITS, GRID } from './constants'


export const isValidGridColumnValue = (value: unknown): value is GridColumnValue => {
  if (typeof value === 'number') return true
  if (typeof value !== 'string') return false

  if (value === 'auto') return true
  if (/^\d+fr$/.test(value)) return true
  return CSS_UNITS.some(unit => value.endsWith(unit))
}

export const isValidGridPattern = (pattern: unknown): pattern is GridColumnsPattern => {
  return Array.isArray(pattern) && pattern.every(value =>
    isValidGridColumnValue(value) ||
    (isResponsiveValue(value) && Object.values(value).every(v =>
      v === undefined || isValidGridColumnValue(v),
    )),
  )
}

export const isGridValue = (value: unknown): value is CSSValue => {
  if (typeof value === 'number') return true
  return (
    typeof value === 'string' &&
    CSS_UNITS.some(unit => value.endsWith(unit))
  )
}

export const isResponsiveValue = <T>(
  value: unknown,
): value is Record<BreakpointKey, T> => {
  if (typeof value !== 'object' || value === null) return false
  return Object.keys(value).every(key =>
    BREAKPOINTS.includes(key as BreakpointKey),
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

export const isValidConfig = (config: unknown): config is Partial<PGConfig> => {
  if (!config || typeof config !== 'object') return false
  const { base, maxWidth, align, zIndex } = config as Partial<PGConfig>

  return ((base === undefined || (base >= GRID.LIMITS.BASE.MIN && base <= GRID.LIMITS.BASE.MAX)) && (maxWidth === undefined || isGridValue(maxWidth) || isResponsiveValue(maxWidth)) && (align === undefined || isGridAlignment(align)) && (zIndex === undefined || true))
}