import type { CSSValue } from './common'

// CSS Custom Properties
export type CSSCustomProperties = Record<`--grid-${string}` | `--stack-${string}` | `--spacer-${string}`, CSSValue>;