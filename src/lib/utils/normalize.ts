import { clamp, convertValue, CSSValue } from './index'

export interface NormalizationOptions {
  /** Base unit for normalization (default: 8) */
  base?: number;
  /** Whether to round to the nearest multiple of the base (default: true) */
  round?: boolean;
  /** Clamp configuration (optional) */
  clamp?: { min?: number; max?: number };
  /** If true, no warnings are logged when values are adjusted (default: false) */
  suppressWarnings?: boolean;
}

/**
 * Normalizes a CSSValue to a number based on a given base.
 * Rounds to the nearest multiple of the base by default.
 *
 * Examples (with base = 8):
 * - 10 becomes 8 (Math.round(10/8) = 1 → 1×8 = 8)
 * - 13 becomes 16 (Math.round(13/8) = 2 → 2×8 = 16)
 * - "1rem" (assuming 16px) becomes 16.
 *
 * @param value - The CSS value to normalize (e.g., 14, "14px", "1rem", or "auto").
 * @param options - Normalization options.
 * @returns The normalized number.
 */
export function normalizeValue(value: CSSValue, options: NormalizationOptions = {}): number {
  const { base = 8, round: doRound = true, clamp: clampOptions, suppressWarnings = false } = options
  if (value === 'auto') return base
  let num: number | null = null
  if (typeof value === 'number') {
    num = value
  } else if (typeof value === 'string') {
    const conv = convertValue(value)
    if (conv === null) {
      if (!suppressWarnings) {
        console.error(`Failed to convert "${value}" to pixels. Falling back to base ${base}.`)
      }
      num = base
    } else {
      num = conv
    }
  }
  if (num === null) num = base
  const normalized = doRound ? Math.round(num / base) * base : num
  const clamped =
    clampOptions !== undefined
      ? clamp(normalized, clampOptions.min ?? -Infinity, clampOptions.max ?? Infinity)
      : normalized
  if (!suppressWarnings && clamped !== num) {
    console.warn(`Normalized ${num} to ${clamped} to match base ${base}px.`)
  }
  return clamped
}

/**
 * Normalizes a pair of CSSValues.
 * @param values - A tuple of two CSSValues (can be numbers or strings).
 * @param defaults - Defaults to use if a value is undefined.
 * @param options - Normalization options.
 * @returns A tuple of two normalized numbers.
 */
export function normalizeValuePair(
  values: [CSSValue?, CSSValue?] | undefined,
  defaults: [number, number],
  options?: NormalizationOptions,
): [number, number] {
  if (!values) return defaults
  const first = values[0] !== undefined ? normalizeValue(values[0], options) : defaults[0]
  const second = values[1] !== undefined ? normalizeValue(values[1], options) : defaults[1]
  return [first, second]
}

/**
 * Normalizes the dimensions of a DOMRect.
 * @param rect - The DOMRect to normalize.
 * @param options - Normalization options.
 * @returns An object with normalized width, height, top, and left.
 */
export function normalizeRect(
  rect: DOMRect,
  options?: NormalizationOptions,
): { width: number; height: number; top: number; left: number } {
  return {
    width: normalizeValue(rect.width, options),
    height: normalizeValue(rect.height, options),
    top: normalizeValue(rect.top, options),
    left: normalizeValue(rect.left, options),
  }
}

/**
 * Checks whether a CSSValue is already normalized to the given base.
 * @param value - The CSS value to check.
 * @param base - The base unit (default: 8).
 * @returns True if the value is normalized, false otherwise.
 */
export function isNormalized(value: CSSValue, base: number = 8): boolean {
  if (value === 'auto') return true
  const normalized = normalizeValue(value, { base, suppressWarnings: true })
  let num: number | null = null
  if (typeof value === 'number') {
    num = value
  } else if (typeof value === 'string') {
    const conv = convertValue(value)
    if (conv === null) return false
    num = conv
  }
  return num === normalized
}
