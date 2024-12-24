import type { CSSProperties } from 'react'

import type { CSSValue } from './common'

export type CSSCustomProperties = {
  [key: `--grid-${string}`]: CSSValue
}

export interface BaseGridStyles extends Partial<CSSProperties & CSSCustomProperties> {
  '--grid-base'?: `${number}px`
  '--grid-max-width'?: CSSValue
  '--grid-z-index'?: number
  '--grid-justify'?: string
}

export interface GridLineStyles {
  '--column-width': '1px'
  '--row-height': '1px'
}

export interface GridFlatStyles {
  '--column-width': CSSValue
  '--row-height': CSSValue
  '--row-opacity': '0' | '1'
}
