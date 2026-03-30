import { convertValue } from './convert'
import { clamp } from './math'

export interface NormalizationOptions {
  base?: number
  round?: boolean
  clamp?: { min?: number; max?: number }
  suppressWarnings?: boolean
}

export function normalizeValue(
  value: string | number | undefined,
  options: NormalizationOptions = {}
): number {
  const {
    base = 8,
    round: doRound = true,
    clamp: clampOptions,
    suppressWarnings = false,
  } = options

  if (value === 'auto') return base

  let num: number | null = null
  if (typeof value === 'number') {
    num = value
  } else if (typeof value === 'string') {
    const conv = convertValue(value)
    if (conv === null) {
      if (!suppressWarnings && process.env.NODE_ENV === 'development') {
        console.error(
          `Failed to convert "${value}" to pixels. Falling back to base ${base}.`
        )
      }
      num = base
    } else {
      num = conv
    }
  }
  if (num === null) num = base

  if (base <= 0) return num

  const normalized = doRound ? Math.round(num / base) * base : num

  const clamped =
    clampOptions !== undefined
      ? clamp(
          normalized,
          clampOptions.min ?? -Infinity,
          clampOptions.max ?? Infinity
        )
      : normalized

  if (
    !suppressWarnings &&
    clamped !== num &&
    process.env.NODE_ENV === 'development'
  ) {
    console.warn(`Normalized ${num} to ${clamped} to match base ${base}px.`)
  }

  return clamped
}

export function normalizeValuePair(
  values:
    | [string | number | undefined, string | number | undefined]
    | undefined,
  defaults: [number, number],
  options?: NormalizationOptions
): [number, number] {
  if (!values) return defaults

  if (values[0] === undefined && values[1] === undefined) {
    return defaults
  }

  const first =
    values[0] !== undefined ? normalizeValue(values[0], options) : defaults[0]
  const second =
    values[1] !== undefined ? normalizeValue(values[1], options) : defaults[1]
  return [first, second]
}
