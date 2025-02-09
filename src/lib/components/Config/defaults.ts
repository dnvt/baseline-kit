/**
 * @file defaults.ts
 * @description Default theme and configuration values for baseline-kit
 * @module baseline-kit/components/Config
 */

import type { Config } from './Config'

/**
 * CSS variable-based color configuration for Guide component.
 * Maps each guide variant to its theme color.
 */
const GUIDE_COLORS = {
  /** Color for single-line guides */
  line: 'var(--bk-guide-color-line-theme)',
  /** Color for pattern-based guides */
  pattern: 'var(--bk-guide-color-pattern-theme)',
  /** Color for auto-calculated guides */
  auto: 'var(--bk-guide-color-auto-theme)',
  /** Color for fixed-column guides */
  fixed: 'var(--bk-guide-color-fixed-theme)',
} as const

/**
 * CSS variable-based color configuration for Baseline component.
 */
const BASELINE_COLORS = {
  /** Color for line variant */
  line: 'var(--bk-baseline-color-line-theme)',
  /** Color for flat/block variant */
  flat: 'var(--bk-baseline-color-flat-theme)',
} as const

/**
 * CSS variable-based color configuration for Spacer component.
 */
const SPACER_COLORS = {
  /** Color for line-style spacers */
  line: 'var(--bk-spacer-color-line-theme)',
  /** Color for flat/block spacers */
  flat: 'var(--bk-spacer-color-flat-theme)',
  /** Color for measurement indicators */
  indice: 'var(--bk-spacer-color-indice-theme)',
} as const

/**
 * CSS variable-based color configuration for Box component.
 */
const BOX_COLORS = {
  /** Border color for debug outline */
  line: 'var(--bk-box-color-line-theme)',
  /** Background color for debug mode */
  flat: 'var(--bk-box-color-flat-theme)',
  /** Color for measurement indicators */
  indice: 'var(--bk-box-color-indice-theme)',
} as const

/**
 * CSS variable-based color configuration for Stack/Flex component.
 */
const STACK_COLORS = {
  /** Border color for debug outline */
  line: 'var(--bk-stack-color-line-theme)',
  /** Background color for debug mode */
  flat: 'var(--bk-stack-color-flat-theme)',
  /** Color for measurement indicators */
  indice: 'var(--bk-stack-color-indice-theme)',
} as const

/**
 * CSS variable-based color configuration for Layout component.
 */
const LAYOUT_COLORS = {
  /** Border color for debug outline */
  line: 'var(--bk-layout-color-line-theme)',
  /** Background color for debug mode */
  flat: 'var(--bk-layout-color-flat-theme)',
  /** Color for measurement indicators */
  indice: 'var(--bk-layout-color-indice-theme)',
} as const

/** CSS variable for Padder component color */
const PADDER_COLOR = 'var(--bk-padder-color-theme)'

/**
 * Default configuration for baseline-kit.
 *
 * @remarks
 * Provides the base configuration for all components including:
 * - Base unit for spacing calculations (8px default)
 * - Default component variants
 * - Initial debugging modes
 * - Theme color assignments
 *
 * Each component section includes:
 * - Visual variant selection (where applicable)
 * - Debugging mode setting
 * - Color theme assignments
 *
 * The configuration is marked as const to ensure type safety
 * and prevent accidental modifications.
 */
export const DEFAULT_CONFIG: Config = {
  /** Base unit for spacing calculations (in pixels) */
  base: 8,

  /** Baseline grid configuration */
  baseline: {
    variant: 'line',
    debugging: 'hidden',
    colors: BASELINE_COLORS,
  },

  /** Guide overlay configuration */
  guide: {
    variant: 'line',
    debugging: 'hidden',
    colors: GUIDE_COLORS,
  },

  /** Spacer component configuration */
  spacer: {
    variant: 'line',
    debugging: 'hidden',
    colors: SPACER_COLORS,
  },

  /** Box component configuration */
  box: {
    debugging: 'hidden',
    colors: BOX_COLORS,
  },

  /** Stack/Flex component configuration */
  flex: {
    debugging: 'hidden',
    colors: STACK_COLORS,
  },

  /** Layout component configuration */
  layout: {
    debugging: 'hidden',
    colors: LAYOUT_COLORS,
  },

  /** Padder component configuration */
  padder: {
    debugging: 'hidden',
    color: PADDER_COLOR,
  },
} as const