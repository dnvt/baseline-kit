import { GuideColumnsPattern } from '../types'
import { CSSProperties } from 'react'

/**
 * Shared fields for guide configurations.
 *
 * @property gap - The multiplier for the base spacing unit.
 *   For example, if `gap = 2` and `base = 8`, the actual gap becomes `16px`.
 * @property base - The base spacing unit (in px). Usually derived from theme config.
 */
type BaseGuideConfig = {
  /** Multiplier for the base spacing unit (e.g., 2 => 2 * base). */
  gap?: number;
  /** The baseline spacing unit (in px). */
  base?: number;
};

/**
 * Pattern-based guide configuration.
 *
 * @remarks
 * Use this to define a repeating array of column widths.
 * For example, columns: [100, 200, 100] will cycle through widths in that order.
 *
 * @example
 * ```ts
 * const patternConfig: PatternConfig = {
 *   variant: 'pattern',
 *   columns: [100, 200, 100],
 *   gap: 2, // gap * base => actual gap in px
 *   base: 8 // defaults if not overridden
 * };
 * ```
 */
export type PatternConfig = BaseGuideConfig & {
  variant: 'pattern';
  /** An array of numeric widths or CSSValue strings, cycled through repeatedly. */
  columns: GuideColumnsPattern;
  /** `columnWidth` is not used in pattern mode. */
  columnWidth?: never;
};

/**
 * Fixed guide configuration.
 *
 * @remarks
 * Use this when you have a fixed number of columns. Optionally,
 * specify a columnWidth for each column, or omit it to let the guide calculate automatically.
 *
 * @example
 * ```ts
 * const fixedConfig: FixedConfig = {
 *   variant: 'fixed',
 *   columns: 12,
 *   columnWidth: '80px',
 *   gap: 1,
 *   base: 8
 * };
 * ```
 */
export type FixedConfig = BaseGuideConfig & {
  variant: 'fixed';
  /** Total number of columns to render. */
  columns: number;
  /** Optional fixed width for each column (e.g., "100px", "8rem"). */
  columnWidth?: CSSProperties['width'];
};

/**
 * Auto guide configuration.
 *
 * @remarks
 * Allows an automatic number of columns based on a specified columnWidth.
 *
 * @example
 * ```ts
 * const autoConfig: AutoConfig = {
 *   variant: 'auto',
 *   columnWidth: '200px', // the guide will figure out how many columns fit
 *   gap: 2,
 *   base: 8
 * };
 * ```
 */
export type AutoConfig = BaseGuideConfig & {
  variant: 'auto';
  /** Width for each column, leaving the guide to calculate how many fit. */
  columnWidth: CSSProperties['columnWidth'];
  /** `columns` is not used in auto mode. */
  columns?: never;
};

/**
 * Line-based guide configuration (default variant if not specified).
 *
 * @remarks
 * Draws evenly spaced vertical lines. The gap is multiplied by the base unit
 * to get the final pixel distance between lines.
 *
 * @example
 * ```ts
 * const lineConfig: LineConfig = {
 *   variant: 'line',
 *   gap: 1,
 *   base: 8
 * };
 * ```
 */
export type LineConfig = BaseGuideConfig & {
  /** The line variant if not explicitly stated defaults to 'line'. */
  variant?: 'line';
  /** No columns are used for line mode. */
  columns?: never;
  /** No columnWidth is used for line mode. */
  columnWidth?: never;
};