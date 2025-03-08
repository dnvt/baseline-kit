/**
 * @file types.ts
 * @description Type definitions for Guide component configurations
 * @module baseline-kit/components/Guide/types
 */

import * as React from 'react'
import { GuideColumnsPattern } from '../types'

/**
 * Base configuration shared by all guide variants.
 *
 * @example
 * ```ts
 * const baseConfig: BaseGuideConfig = {
 *   gap: 2,     // 2px gap
 *   base: 8     // 8px base unit
 * }
 * ```
 */
type BaseGuideConfig = {
  /** Gap between columnms. */
  gap?: React.CSSProperties['gap']

  /**
   * Base unit in pixels for spacing calculations.
   * Typically inherited from theme configuration.
   */
  base?: number
}

/**
 * Pattern-based grid configuration.
 * Defines repeating column width patterns.
 *
 * @example
 * ```ts
 * // Three-column pattern: 100px | 200px | 100px
 * const pattern: PatternConfig = {
 *   variant: 'pattern',
 *   columns: [100, '200px', '1fr'],
 *   gap: 2
 * }
 *
 * // Responsive pattern with mixed units
 * const responsive: PatternConfig = {
 *   variant: 'pattern',
 *   columns: ['20%', '1fr', '200px'],
 *   gap: 2
 * }
 * ```
 */
export type PatternConfig = BaseGuideConfig & {
  /** Identifies this as a pattern-based configuration */
  variant: 'pattern'
  /** Array of column widths that repeat */
  columns: GuideColumnsPattern
  /** Not applicable in pattern mode */
  columnWidth?: never
}

/**
 * Fixed-column grid configuration.
 * Specifies exact number of equal-width columns.
 *
 * @example
 * ```ts
 * // Basic 12-column grid
 * const grid: FixedConfig = {
 *   variant: 'fixed',
 *   columns: 12,
 *   gap: 2
 * }
 *
 * // Fixed-width columns
 * const fixed: FixedConfig = {
 *   variant: 'fixed',
 *   columns: 6,
 *   columnWidth: '160px',
 *   gap: 2
 * }
 * ```
 */
export type FixedConfig = BaseGuideConfig & {
  /** Identifies this as a fixed-column configuration */
  variant: 'fixed'
  /** Number of columns to create */
  columns: number
  /** Optional fixed width for all columns */
  columnWidth?: React.CSSProperties['width']
}

/**
 * Auto-calculated grid configuration.
 * Creates as many columns as will fit given a column width.
 *
 * @example
 * ```ts
 * // Auto-fit columns of 200px
 * const auto: AutoConfig = {
 *   variant: 'auto',
 *   columnWidth: '200px',
 *   gap: 2
 * }
 *
 * // Responsive columns with minimum width
 * const responsive: AutoConfig = {
 *   variant: 'auto',
 *   columnWidth: 'minmax(200px, 1fr)',
 *   gap: 2
 * }
 * ```
 */
export type AutoConfig = BaseGuideConfig & {
  /** Identifies this as an auto-calculated configuration */
  variant: 'auto'
  /** Desired width for each column */
  columnWidth: React.CSSProperties['columnWidth']
  /** Not applicable in auto mode */
  columns?: never
}

/**
 * Simple line-based guide configuration.
 * Creates evenly-spaced vertical lines.
 *
 * @example
 * ```ts
 * // Basic line guide
 * const lines: LineConfig = {
 *   variant: 'line',
 *   gap: 1
 * }
 *
 * // Custom-spaced lines
 * const wideLines: LineConfig = {
 *   variant: 'line',
 *   gap: 4,
 *   base: 8
 * }
 * ```
 */
export type LineConfig = BaseGuideConfig & {
  /** Optional variant identifier (defaults to 'line') */
  variant?: 'line'
  /** Not applicable in line mode */
  columns?: never
  /** Not applicable in line mode */
  columnWidth?: never
}
