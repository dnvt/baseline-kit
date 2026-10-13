import {
  parseUnit,
  formatValue,
  isCSSLength,
  isRootRelative,
} from '@baseline-kit/core'

describe('parseUnit', () => {
  it('parses a valid pixel value', () => {
    expect(parseUnit('100px')).toEqual({ value: 100, unit: 'px' })
  })

  it('parses a decimal value with rem unit', () => {
    expect(parseUnit('1.5rem')).toEqual({ value: 1.5, unit: 'rem' })
  })

  it('parses negative percentage values', () => {
    expect(parseUnit('-20%')).toEqual({ value: -20, unit: '%' })
  })

  it('parses values with a plus sign', () => {
    expect(parseUnit('+10em')).toEqual({ value: 10, unit: 'em' })
  })

  it('trims leading and trailing whitespace', () => {
    expect(parseUnit('  50vw  ')).toEqual({ value: 50, unit: 'vw' })
  })

  it('returns null for invalid inputs', () => {
    expect(parseUnit('abc')).toBeNull()
    expect(parseUnit('100')).toBeNull() // Missing unit
  })
})

describe('formatValue', () => {
  it('returns the default value with "px" when input is undefined and defaultValue is provided', () => {
    expect(formatValue(undefined, 10)).toBe('10px')
  })

  it('returns "auto" unchanged', () => {
    expect(formatValue('auto')).toBe('auto')
  })

  it('returns valid CSS strings as-is', () => {
    expect(formatValue('100%')).toBe('100%')
    expect(formatValue('1fr')).toBe('1fr')
    expect(formatValue('14px')).toBe('14px')
    expect(formatValue('0')).toBe('0')
  })

  it('formats numeric values by appending "px"', () => {
    expect(formatValue(14)).toBe('14px')
  })

  it('returns non-matching strings unchanged', () => {
    // "some random value" does not match the regex for special cases, so it is returned as-is.
    expect(formatValue('some random value')).toBe('some random value')
  })
})

describe('isCSSLength', () => {
  it('accepts lengths and math functions of lengths', () => {
    for (const value of [
      '3rem',
      '1.3rem',
      ' 0.5rem ',
      '50%',
      '10vh',
      '2ch',
      '-4px',
      '1e1px',
      'calc(100% - 23px)',
      'min(10vh, 3rem)',
      'clamp(1rem, 2vw, 3rem)',
      'max(2rem,10%)',
      'var(--space)',
      'var(--space, 8px)',
      'calc(var(--a) * 2)',
      'calc((1px + 2px) * 2)',
      'calc(10px / 2)',
      'calc(100% - -4px)',
      'min(calc(1rem + 2px), 50%)',
      '1REM',
      '2vi',
      '3svmin',
      // A var() operand takes the other operand's type.
      'calc(var(--n) * 1rem)',
      'calc(1rem * var(--n))',
      'calc(var(--a) * (1px + 2px))',
      // Whitespace before a comma.
      'min(1px , 2px)',
      'clamp(1rem , 2vw , 3rem)',
      // A var() fallback that fits; non-ASCII custom property names.
      'var(--space, 8px)',
      'calc(var(--a, 2) * 1px)',
      'var(--größe)',
      // Stepped functions, supported wherever round() is.
      'round(1.3rem, 8px)',
      'round(up, 1.3rem, 8px)',
      'calc(round(2.5) * 1rem)',
      'mod(10px, 3px)',
      'calc(100% - rem(10px, 3px))',
    ]) {
      expect(isCSSLength(value), value).toBe(true)
    }
  })

  it('leaves keywords, unitless numbers and malformed functions out', () => {
    for (const value of [
      'auto',
      '24',
      '0',
      'min-content',
      'calc(oops)',
      'calc(100% - 23px',
      'calc()',
      'calc(1 + 2)',
      '2chx',
      'rem',
      'fit-content(10px)',
      '10px 20px',
      'url(x)',
      // CSS rejects these, so a Spacer would collapse instead of falling back.
      'calc(100%-23px)',
      'calc(1px+2px)',
      '3.rem',
      '1.e2px',
      'calc(1px 2px)',
      'calc(2 * --x)',
      'calc(1px +)',
      'min(1px), max(2px)',
      'calc(1px * 2px)',
      'calc(10px / 2px)',
      'calc(1 + 1px)',
      'clamp(1px, 2px)',
      'var(x)',
      'calc(2 * 3)',
      // Not CSS whitespace.
      'calc(1px\u00a0+ 2px)',
      '\u00a02px',
      // A fallback that doesn't fit (unset, the value would be invalid).
      'var(--a, 2)',
      'calc(var(--a, 1px) * 1rem)',
      'var(--a,)',
      // Stepped functions need their arguments; abs() is newer than round().
      'round(1.3rem)',
      'round(sideways, 1px, 2px)',
      'mod(10px)',
      'mod(10px, 3)',
      'abs(-2px)',
      // Units newer than round() in some browsers keep the base fallback.
      '2lh',
      '1rlh',
      '2cap',
      '5cqw',
    ]) {
      expect(isCSSLength(value), value).toBe(false)
    }
  })
})

describe('isRootRelative', () => {
  it('spots values that follow the root font size', () => {
    for (const value of ['1rem', '0.5 rem', 'calc(1rem + 2px)', '1REM'])
      expect(isRootRelative(value), value).toBe(true)
    for (const value of [
      16,
      '16px',
      '1em',
      '10vh',
      'auto',
      '2rlh',
      'remainder',
      undefined,
    ])
      expect(isRootRelative(value), String(value)).toBe(false)
  })
})
