export function parseUnit(
  value: string
): { value: number; unit: string } | null {
  const match = value.trim().match(/^([+-]?[\d.]+)([a-zA-Z%]+)$/)
  if (!match) return null
  const num = parseFloat(match[1])
  const unit = match[2]
  return { value: num, unit }
}

export function formatValue(
  value: string | number | undefined,
  defaultValue?: number
): string {
  if (value === undefined && defaultValue !== undefined)
    return `${defaultValue}px`
  if (
    value === 'auto' ||
    (typeof value === 'string' &&
      /^(auto|100%|0|.*(fr|vh|vw|vmin|vmax|rem))$/.test(value))
  ) {
    return String(value)
  }
  if (typeof value === 'number') return `${value}px`
  return value ?? ''
}

const LENGTH_UNIT =
  '(?:px|em|rem|ex|rex|ch|rch|cap|rcap|ic|ric|lh|rlh|vw|vh|vi|vb|vmin|vmax|' +
  'svw|svh|svi|svb|svmin|svmax|lvw|lvh|lvi|lvb|lvmin|lvmax|dvw|dvh|dvi|dvb|' +
  'dvmin|dvmax|cqw|cqh|cqi|cqb|cqmin|cqmax|cm|mm|q|in|pt|pc|%)'
const NUMBER = '[+-]?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[+-]?\\d+)?'
const LENGTH = new RegExp(`^${NUMBER}${LENGTH_UNIT}$`, 'i')
// One token of a math function: whitespace, a custom property name (before
// the operators, which include `-`), an operator, a parenthesis or comma, a
// number with an optional length unit, or a function name.
const MATH_TOKEN = new RegExp(
  `\\s+|--[\\w-]+|[-+*/,()]|${NUMBER}${LENGTH_UNIT}?(?![\\w%])|(?:calc|min|max|clamp|var)(?=\\()`,
  'iy'
)

/**
 * Whether a string is a CSS length the browser can resolve as the page
 * changes: a number with a length unit or `%`, or `calc()`, `min()`, `max()`,
 * `clamp()` or `var()` built from lengths, numbers, operators and custom
 * properties. Conservative: anything else (`'auto'`, `'24'`, keywords,
 * malformed functions) is left to the kit's own px resolution, because CSS
 * would drop an invalid value without a fallback.
 */
export function isCSSLength(value: string): boolean {
  const text = value.trim()
  if (LENGTH.test(text)) return true
  if (!/^(?:calc|min|max|clamp|var)\(/i.test(text) || !text.endsWith(')')) {
    return false
  }
  let depth = 0
  let hasLength = false
  MATH_TOKEN.lastIndex = 0
  while (MATH_TOKEN.lastIndex < text.length) {
    const match = MATH_TOKEN.exec(text)
    if (!match) return false
    const token = match[0]
    if (token === '(') depth++
    else if (token === ')' && --depth < 0) return false
    else if (LENGTH.test(token) || token.startsWith('--')) hasLength = true
  }
  return depth === 0 && hasLength
}

/**
 * Whether a value depends on the root font size (`rem` and the other
 * root-relative units), so whatever resolves it must follow root changes.
 */
export function isRootRelative(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    /\d\s*(?:rem|rlh|rex|rch|rcap|ric)(?![\w-])/i.test(value)
  )
}
