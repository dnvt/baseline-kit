import type { CSSProperties } from 'react'
import { DebuggingMode } from '@components'

// Spacing & Padding -----------------------------------------------------------

/** Represents spacing values that can be provided in different formats. */
export type Spacing =
  | number
  | [number, number]
  | { start?: number; end?: number }

/** A padding value can be provided as a number, an array, or an object. */
export type PaddingValue =
  | number
  | [number, number]                    // [block, inline]
  | [number, number, number, number]    // [top, right, bottom, left]
  | {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

/** A complete padding object with numeric values for all edges. */
export type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Spacing props used in component interfaces. */
export type SpacingProps = {
  padding?: PaddingValue;
  block?: Spacing;
  inline?: Spacing;
}

// Grid Column Types  ----------------------------------------------------------

/** Valid variants for the guide/grid column. */
export type GuideVariant = 'line' | 'pattern' | 'fixed' | 'auto'

/** A grid column value may be a CSSValue or the string "auto". */
export type GuideColumnValue = string | number | undefined | 'auto'

/** A pattern for grid columns, defined as an array of GuideColumnValue. */
export type GuideColumnsPattern = readonly GuideColumnValue[]

// Grid Constants & Types  -----------------------------------------------------

export const GRID_ALIGNMENTS = ['start', 'center', 'end'] as const
export type GridAlignment = typeof GRID_ALIGNMENTS[number]

export const PADD_VARIANTS = ['line', 'flat'] as const
export type PaddedVariant = typeof PADD_VARIANTS[number]

// Common Component Types  -----------------------------------------------------

/**
 * Props common to all components in the library.
 * Includes spacing, sizing, and debugging controls.
 */
export type ComponentsProps = {
  /** Controls debug-related visibility and overlays. */
  debugging?: DebuggingMode
  className?: string
  style?: CSSProperties
  /** Component height (default: "fit-content") */
  height?: CSSProperties['height']
  /** Component width (default: "fit-content") */
  width?: CSSProperties['width']
} & SpacingProps

/** Base configuration for padded components. */
export type PaddedBaseConfig = {
  base?: number
  color?: CSSProperties['color'] | CSSProperties['backgroundColor']
  zIndex?: CSSProperties['zIndex']
}

export type Variant = 'line' | 'flat' | 'pattern'