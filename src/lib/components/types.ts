import type { CSSProperties } from 'react'
import { DebuggingMode } from '@components'

// Spacing Types  --------------------------------------------------------------

/**
 * Defines spacing as either a single value, start/end pair, or object with explicit edges.
 * Used for block and inline spacing across components.
 *
 * @example
 * ```tsx
 * // Single value
 * <Box block={8} />
 *
 * // Start/end pair
 * <Box block={[8, 16]} />
 *
 * // Object with explicit values
 * <Box block={{ start: 8, end: 16 }} />
 * ```
 */
export type Spacing =
  | number
  | [number, number]
  | { start?: number; end?: number }

/**
 * Flexible padding definition that supports multiple formats for setting padding on all sides.
 *
 * @example
 * ```tsx
 * // Single value for all sides
 * padding={8}
 *
 * // Block and inline pairs
 * padding={[8, 16]}
 *
 * // Explicit values for each side
 * padding={[8, 16, 8, 16]}
 *
 * // Object with named sides
 * padding={{ top: 8, right: 16, bottom: 8, left: 16 }}
 * ```
 */
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

/** Resolved padding values for all edges after normalization. */
export type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Props interface for components that support spacing configuration. */
export type SpacingProps = {
  padding?: PaddingValue;
  block?: Spacing;
  inline?: Spacing;
}

// Grid Types ------------------------------------------------------------------

/** Controls how columns are laid out in grid components. */
export type GuideVariant = 'line' | 'pattern' | 'fixed' | 'auto'

/**
 * Valid value types for grid columns. Can be a CSS length, fractional unit,
 * or 'auto' for automatic sizing.
 */
export type GuideColumnValue = string | number | undefined | 'auto'

/** Array of column definitions for pattern-based grid layouts. */
export type GuideColumnsPattern = readonly GuideColumnValue[]

// === Grid Constants ===

/** Valid grid alignment values. */
export const GRID_ALIGNMENTS = ['start', 'center', 'end'] as const
export type GridAlignment = typeof GRID_ALIGNMENTS[number]

/** Valid component variants affecting visual style. */
export const PADD_VARIANTS = ['line', 'flat'] as const
export type PaddedVariant = typeof PADD_VARIANTS[number]

// Component Base Types --------------------------------------------------------

/**
 * Common props shared across library components.
 * Provides consistent sizing, spacing, styling, and debugging options.
 */
export type ComponentsProps = {
  debugging?: DebuggingMode;
  className?: string;
  style?: CSSProperties;
  height?: CSSProperties['height'];
  width?: CSSProperties['width'];
} & SpacingProps

/** Base configuration for components that support padding. */
export type PaddedBaseConfig = {
  base?: number;
  color?: CSSProperties['color'] | CSSProperties['backgroundColor'];
  zIndex?: CSSProperties['zIndex'];
}

export type Variant = 'line' | 'flat' | 'pattern'