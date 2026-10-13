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
// A CSS number: digits after a decimal point are required ('3.' is not one).
const NUMBER = '[+-]?(?:\\d+(?:\\.\\d+)?|\\.\\d+)(?:e[+-]?\\d+)?'
const LENGTH = new RegExp(`^${NUMBER}${LENGTH_UNIT}$`, 'i')
const VALUE = new RegExp(`${NUMBER}(${LENGTH_UNIT})?(?![\\w%.])`, 'iy')
const MATH_FUNCTION = /(?:calc|min|max|clamp|var)\(/iy
const CUSTOM_PROPERTY = /--[\w-]+/y

/** What a math expression resolves to; `var()` could be either. */
type MathType = 'number' | 'length' | 'any'

const sameType = (a: MathType, b: MathType): MathType | null =>
  a === 'any' ? b : b === 'any' || a === b ? a : null

/**
 * Reads a `calc()`, `min()`, `max()`, `clamp()` or `var()` expression the way
 * CSS parses it, closely enough to know whether it is a valid length: `+` and
 * `-` need whitespace on both sides, operands must have compatible types, and
 * the whole string must be consumed. Returns null for anything else.
 */
function readMathFunction(text: string): MathType | null {
  let at = 0
  const skipSpace = () => {
    const start = at
    while (/\s/.test(text[at] ?? '')) at++
    return at > start
  }
  const match = (pattern: RegExp) => {
    pattern.lastIndex = at
    const found = pattern.exec(text)
    if (found) at = pattern.lastIndex
    return found
  }

  function mathFunction(): MathType | null {
    const head = match(MATH_FUNCTION)
    if (!head) return null
    const name = head[0].slice(0, -1).toLowerCase()
    skipSpace()
    let type: MathType | null
    if (name === 'var') {
      if (!match(CUSTOM_PROPERTY)) return null
      skipSpace()
      if (text[at] === ',') {
        at++
        skipSpace()
        if (sum() === null) return null
      }
      type = 'any'
    } else {
      type = sum()
      let count = 1
      while (type !== null && text[at] === ',') {
        at++
        skipSpace()
        const next = sum()
        type = next === null ? null : sameType(type, next)
        count++
      }
      if ((name === 'calc' && count !== 1) || (name === 'clamp' && count !== 3))
        return null
    }
    skipSpace()
    if (type === null || text[at] !== ')') return null
    at++
    return type
  }

  function factor(): MathType | null {
    if (text[at] === '(') {
      at++
      skipSpace()
      const type = sum()
      skipSpace()
      if (type === null || text[at] !== ')') return null
      at++
      return type
    }
    MATH_FUNCTION.lastIndex = at
    if (MATH_FUNCTION.test(text)) return mathFunction()
    const value = match(VALUE)
    return value ? (value[1] ? 'length' : 'number') : null
  }

  function product(): MathType | null {
    let type = factor()
    while (type !== null) {
      const before = at
      skipSpace()
      const operator = text[at]
      if (operator !== '*' && operator !== '/') {
        at = before
        break
      }
      at++
      skipSpace()
      const next = factor()
      if (next === null) return null
      if (operator === '*') {
        type =
          type === 'number'
            ? next
            : next === 'number'
              ? type
              : sameType(type, next) === 'any'
                ? 'any'
                : null
      } else {
        // Dividing by a length isn't a length.
        type = next === 'length' ? null : type
      }
    }
    return type
  }

  function sum(): MathType | null {
    let type = product()
    while (type !== null) {
      const before = at
      if (!skipSpace() || (text[at] !== '+' && text[at] !== '-')) {
        at = before
        break
      }
      at++
      if (!skipSpace()) return null
      const next = product()
      type = next === null ? null : sameType(type, next)
    }
    return type
  }

  const type = mathFunction()
  return at === text.length ? type : null
}

/**
 * Whether a string is a CSS length the browser can resolve as the page
 * changes: a number with a length unit or `%`, or `calc()`, `min()`, `max()`,
 * `clamp()` or `var()` that resolves to one. Conservative: anything else
 * (`'auto'`, `'24'`, keywords, malformed math such as `'calc(100%-23px)'`)
 * is left to the kit's own px resolution, because CSS would drop an invalid
 * value without a fallback.
 */
export function isCSSLength(value: string): boolean {
  const text = value.trim()
  if (LENGTH.test(text)) return true
  const type = readMathFunction(text)
  return type === 'length' || type === 'any'
}

/**
 * Whether a value contains a `rem` length, the root-relative unit the kit's
 * unit conversion resolves: whatever converts it must follow root font size
 * changes.
 */
export function isRootRelative(value: unknown): boolean {
  return typeof value === 'string' && /\d\s*rem(?![\w-])/i.test(value)
}
