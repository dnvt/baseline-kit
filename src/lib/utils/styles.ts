import type { CSSCustomProperties, CSSValue } from '@types'
import { CSSProperties } from 'react'

export const combineClassNames = (
  ...classes: Array<string | boolean | undefined | null>
): string => classes.filter(Boolean).join(' ').trim()

export const combineStyles = <
  T extends Partial<CSSProperties & CSSCustomProperties>,
>(
    ...styles: Array<T | undefined>
  ): T =>
    styles
      .filter((style): style is T => style !== undefined)
      .reduce((acc, style) => ({ ...acc, ...style }), {} as T)

export const parseGridValue = (value: CSSValue | 'auto'): string => {
  if (value === 'auto') return value
  return typeof value === 'number' ? `${value}px` : value.toString()
}