import type { BreakpointKey, CSSCustomProperties, CSSValue, ResponsiveValue } from '@types'
import { isResponsiveValue } from '@/utils/validation.ts'
import { GRID } from '@/utils/constants.ts'
import type { CSSProperties } from 'react'

export const combineClassNames = (
  ...classes: Array<string | boolean | undefined | null>
): string => classes.filter(Boolean).join(' ').trim()

export const combineStyles = <T extends Partial<CSSProperties & CSSCustomProperties>>(
  ...styles: Array<T | undefined>
): T =>
    styles
      .filter((style): style is T => style !== undefined)
      .reduce((acc, style) => ({ ...acc, ...style }), {} as T)


export const parseGridValue = (value: CSSValue | 'auto'): string => {
  if (value === 'auto') return value
  return typeof value === 'number' ? `${value}px` : value.toString()
}

export const parseResponsiveGridValue = (
  value: ResponsiveValue<CSSValue> | undefined,
  defaultValue = GRID.DEFAULTS.MAX_WIDTH,
): string => {
  if (value === undefined) return defaultValue

  if (isResponsiveValue(value)) {
    return Object.entries(value)
      .map(([bp, val]) => {
        if (val === undefined) return null
        return bp === 'base'
          ? parseGridValue(val)
          : `@container (min-width: ${GRID.BREAKPOINTS[bp as BreakpointKey]}) { ${parseGridValue(val)} }`
      })
      .filter((v): v is string => v !== null)
      .join('; ')
  }

  return parseGridValue(value)
}