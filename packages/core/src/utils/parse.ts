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

// Units every browser with CSS round() also supports. Newer ones (lh, rlh,
// cap, ic, rex, rch, container units) are left out: where round() works but
// the unit doesn't, the height would be dropped instead of falling back.
const LENGTH_UNIT =
  '(?:px|em|rem|ex|ch|vw|vh|vi|vb|vmin|vmax|svw|svh|svi|svb|svmin|svmax|' +
  'lvw|lvh|lvi|lvb|lvmin|lvmax|dvw|dvh|dvi|dvb|dvmin|dvmax|cm|mm|q|in|pt|pc|%)'
// CSS whitespace: not every Unicode space.
const CSS_SPACE = /[ \t\n\r\f]/
// A CSS number: digits after a decimal point are required ('3.' is not one).
const NUMBER = '[+-]?(?:\\d+(?:\\.\\d+)?|\\.\\d+)(?:e[+-]?\\d+)?'
const LENGTH = new RegExp(`^${NUMBER}${LENGTH_UNIT}$`, 'i')
const VALUE = new RegExp(`${NUMBER}(${LENGTH_UNIT})?(?![\\w%.])`, 'iy')
// round(), mod() and rem() have the same browser floor as round() itself.
const MATH_FUNCTION = /(?:calc|min|max|clamp|round|mod|rem|var)\(/iy
// Custom property names may use any non-ASCII character.
const CUSTOM_PROPERTY = /--[-\w\u0080-\u{10FFFF}]+/uy
const ROUNDING_STRATEGY = /(?:nearest|up|down|to-zero)[ \t\n\r\f]*,/iy

/** What a math expression resolves to; `var()` could be either. */
type MathType = 'number' | 'length' | 'any'

const sameType = (a: MathType, b: MathType): MathType | null =>
  a === 'any' ? b : b === 'any' || a === b ? a : null

/** The type of a product; `var()` takes the other operand's type. */
const productType = (a: MathType, b: MathType): MathType | null => {
  if (a === 'number' || a === 'any') return b === 'number' ? a : b
  return b === 'length' ? null : a
}

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
    while (CSS_SPACE.test(text[at] ?? '')) at++
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
      // Unset, the fallback is used, so it must fit where the var() is.
      type = 'any'
      if (text[at] === ',') {
        at++
        skipSpace()
        type = sum()
      }
    } else {
      if (name === 'round' && match(ROUNDING_STRATEGY)) skipSpace()
      type = sum()
      let count = 1
      while (type !== null && (skipSpace(), text[at] === ',')) {
        at++
        skipSpace()
        const next = sum()
        type = next === null ? null : sameType(type, next)
        count++
      }
      const counts: Record<string, (count: number) => boolean> = {
        calc: (n) => n === 1,
        clamp: (n) => n === 3,
        mod: (n) => n === 2,
        rem: (n) => n === 2,
        // round(A) rounds to a whole number, so A must be one.
        round: (n) => n === 2 || (n === 1 && type !== 'length'),
      }
      if (counts[name] && !counts[name](count)) return null
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
      // Dividing by a length isn't a length.
      type =
        operator === '*'
          ? productType(type, next)
          : next === 'length'
            ? null
            : type
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
 * (`'auto'`, `'24'`, keywords, malformed math such as `'calc(100%-23px)'`,
 * and units newer than CSS `round()` in some browsers: `lh`, `rlh`, `cap`,
 * `ic`, `rex`, `rch` and container units) is left to the kit's own px
 * resolution, because CSS would drop an invalid value without a fallback.
 * It is not a general CSS validator.
 */
export function isCSSLength(value: string): boolean {
  const text = value.replace(/^[ \t\n\r\f]+|[ \t\n\r\f]+$/g, '')
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
