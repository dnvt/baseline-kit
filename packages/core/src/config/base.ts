import type { ConfigSchema } from './schema'

/** A grid base in px, or in rem to follow the root font size. */
export type BaseValue = number | `${number}rem`

/** The root font size a rem base resolves against on the server. */
export const DEFAULT_ROOT_FONT_SIZE = 16

/**
 * The rem count of a root-relative base: any positive number followed by
 * `rem` (`'0.5rem'`, `'.5rem'`, `'1e-1rem'`). Undefined for a px or invalid
 * base.
 */
export function parseRemBase(base: unknown): number | undefined {
  if (typeof base !== 'string') return undefined
  const value = base.trim()
  if (!value.endsWith('rem')) return undefined
  const number = value.slice(0, -3)
  const rem = number.trim() === number && number !== '' ? Number(number) : NaN
  return rem > 0 && Number.isFinite(rem) ? rem : undefined
}

/** The config with a root-relative base resolved against `rootFontSize`. */
export function resolveConfigBase(
  config: ConfigSchema,
  rootFontSize: number
): ConfigSchema {
  if (config.baseRem === undefined) return config
  const base = config.baseRem * rootFontSize
  return base === config.base ? config : { ...config, base }
}
