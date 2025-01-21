import { SpacingTuple, MeasurementSystem, Spacing, BlockInlineSpacing, NormalizedSpacing, PaddingSpacing } from '@utils'


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
  normalizeValue(value: Spacing | undefined, base: number): SpacingTuple {
    if (!value) return [0, 0]

    if (typeof value === 'number') {
      const normalized = MeasurementSystem.normalize(value, { unit: base })
      return [normalized, normalized]
    }

    const [start, end] = Array.isArray(value)
      ? value
      : [value.start, value.end]

    return [
      MeasurementSystem.normalize(start, { unit: base }),
      MeasurementSystem.normalize(end, { unit: base }),
    ]
  },

  toTuple(value: Spacing): SpacingTuple {
    return typeof value === 'number'
      ? [value, value]
      : Array.isArray(value)
        ? value
        : [value.start, value.end]
  },
}

export const normalizeSpacing = (
  props: BlockInlineSpacing | PaddingSpacing,
  base: number,
): NormalizedSpacing => {
  if ('padding' in props) {
    const { padding } = props

    if (typeof padding === 'number') {
      const normalized = SpacingSystem.normalizeValue(padding, base)
      return { block: normalized, inline: normalized }
    }

    if (Array.isArray(padding)) {
      return padding.length === 2
        ? {
          block: SpacingSystem.normalizeValue(padding[0], base),
          inline: SpacingSystem.normalizeValue(padding[1], base),
        }
        : {
          block: SpacingSystem.normalizeValue([padding[0], padding[2]], base),
          inline: SpacingSystem.normalizeValue([padding[3], padding[1]], base),
        }
    }

    return {
      block: SpacingSystem.normalizeValue([padding.start ?? 0, padding.end ?? 0], base),
      inline: SpacingSystem.normalizeValue([padding.left ?? 0, padding.right ?? 0], base),
    }
  }

  return {
    block: SpacingSystem.normalizeValue(props.block, base),
    inline: SpacingSystem.normalizeValue(props.inline, base),
  }
}
  