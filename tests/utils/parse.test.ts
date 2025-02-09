import { parseUnit, formatValue } from '@utils'

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