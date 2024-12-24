import type { CSSProperties } from 'react'
import type {
  BaseComponentProps,
  GridAlignment,
  CSSValue,
  ResponsiveValue,
  BaseGridConfig,
} from '@types'

export interface PGConfig {
  /** Base unit for baseline spacing calculations (in pixels) */
  base: number
  /** Maximum width for containers */
  maxWidth: ResponsiveValue<CSSValue>
  /** Horizontal alignment for grid containers */
  align: GridAlignment
  /** z-index for grid containers and overlays */
  zIndex: number
}

export interface PGCustomProperties {
  [key: `--${string}`]: string | number | undefined

  '--grid-base': `${number}px`
  '--grid-max-width': string
  '--grid-z-index': number
}

export type PGStyles = CSSProperties & PGCustomProperties

export interface PGState extends PGConfig {
  styles: Partial<PGStyles>
}

export type PGActions =
  | { type: 'UPDATE_CONFIG'; payload: Partial<PGConfig> }
  | { type: 'UPDATE_STYLES'; payload: Partial<PGCustomProperties> }


export interface PaddedGridConfig extends BaseGridConfig {
  align?: GridAlignment
  maxWidth?: ResponsiveValue<CSSValue>
  zIndex?: number
}

export interface PGProps extends BaseComponentProps {
  config?: PaddedGridConfig
  reducer?: (state: PGState, action: PGActions) => PGState
  style?: Partial<PGStyles>
}