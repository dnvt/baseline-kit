import type { BlockInlineSpacing, NormalizedSpacing, PaddingSpacing, Spacing, SpacingTuple } from './units'
import { MeasurementSystem } from '@/utils/measurement'


type SpacingSystemType = {
  /**
   * Normalizes a spacing value to a tuple considering the base unit.
   * It takes a `value`, which can be of type `Spacing` or `undefined`,
   * and a `base` of type `number`. The method returns a tuple
   * representing the normalized spacing values.
   */
  normalizeValue(value: Spacing | undefined, base: number): SpacingTuple

  /**
   * Converts a single spacing value to a tuple without normalization.
   * This method accepts a `value` of type `Spacing` and returns a tuple
   * (`SpacingTuple`) representing the spacing.
   */
  toTuple(value: Spacing): SpacingTuple
}
export const SpacingSystem: SpacingSystemType = {
  normalizeValue(value, base) {
    if (!value) return [0, 0]

    if (typeof value === 'number') {
      const normalized = MeasurementSystem.normalize(value, { unit: base })
      return [normalized, normalized]
    }

    if (Array.isArray(value)) {
      return [
        MeasurementSystem.normalize(value[0], { unit: base }),
        MeasurementSystem.normalize(value[1], { unit: base }),
      ]
    }

    return [
      MeasurementSystem.normalize(value.start, { unit: base }),
      MeasurementSystem.normalize(value.end, { unit: base }),
    ]
  },

  /**
   * Converts a single spacing value to a tuple without normalization
   */
  toTuple(value) {
    if (typeof value === 'number') return [value, value]
    if (Array.isArray(value)) return value
    return [value.start, value.end]
  },
}

/**
 * Normalizes block/inline spacing format
 */
export function normalizeBlockInline(
  props: BlockInlineSpacing,
  base: number,
): NormalizedSpacing {
  return {
    block: SpacingSystem.normalizeValue(props.block, base),
    inline: SpacingSystem.normalizeValue(props.inline, base),
  }
}

/**
 * Normalizes padding format
 */
export function normalizePadding(
  props: PaddingSpacing,
  base: number,
): NormalizedSpacing {
  const { padding } = props

  if (typeof padding === 'number') {
    const normalized = SpacingSystem.normalizeValue(padding, base)
    return {
      block: normalized,
      inline: normalized,
    }
  }

  if (Array.isArray(padding)) {
    if (padding.length === 2) {
      return {
        block: SpacingSystem.normalizeValue(padding[0], base),
        inline: SpacingSystem.normalizeValue(padding[1], base),
      }
    }
    // [top, right, bottom, left]
    return {
      block: SpacingSystem.normalizeValue([padding[0], padding[2]], base),
      inline: SpacingSystem.normalizeValue([padding[3], padding[1]], base),
    }
  }

  return {
    block: SpacingSystem.normalizeValue([padding.start ?? 0, padding.end ?? 0], base),
    inline: SpacingSystem.normalizeValue([padding.left ?? 0, padding.right ?? 0], base),
  }
}

/**
 * Unified spacing normalization that handles both formats
 */
export function normalizeSpacing(
  props: BlockInlineSpacing | PaddingSpacing,
  base: number,
): NormalizedSpacing {
  if ('padding' in props) {
    return normalizePadding(props, base)
  }
  return normalizeBlockInline(props, base)
}
