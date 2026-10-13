import { parseUnit, formatValue, isCSSLength } from '@baseline-kit/core'

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
      'calc(var(--a) * 2)',
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
    ]) {
      expect(isCSSLength(value), value).toBe(false)
    }
  })
})
