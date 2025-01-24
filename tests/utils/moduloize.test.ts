import { CSSValue, moduloize } from '../../src/lib'

describe('moduloize', () => {
  beforeEach(() => {
    // Optionally mock console if you want to see if MeasurementSystem logs anything
    vi.spyOn(console, 'warn').mockImplementation(() => {
    })
    vi.spyOn(console, 'error').mockImplementation(() => {
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns remainder in px for numeric inputs', () => {
    // base=8 => e.g. 14 => 14 % 8=6 => "6px"
    expect(moduloize(14, 8)).toBe('6px')
    // base=8 => 20 => 20%8=4 => "4px"
    expect(moduloize(20, 8)).toBe('4px')

    // If the input is smaller than base => remainder is the same number
    // e.g. 3 => "3px"
    expect(moduloize(3, 8)).toBe('3px')
  })

  it('returns 0px if numeric is multiple of base', () => {
    // e.g. 16 => remainder=0 => "0px"
    expect(moduloize(16, 8)).toBe('0px')
  })

  it('handles negative numbers', () => {
    // e.g. -2 => remainder = -2 % 8 => -2 in JS
    // That might yield "6" if you want a strictly positive remainder,
    // but your code doesn't do that.  So we expect "-2px".
    expect(moduloize(-2, 8)).toBe('-2px')
  })

  it('returns "0px" for undefined', () => {
    // if `value` is undefined => fallback 0 => remainder=0 => "0px"
    expect(moduloize(undefined, 8)).toBe('0px')
  })

  it('parses px units and applies remainder', () => {
    // "14px" => 14 => 14%8=6 => "6px"
    expect(moduloize('14px', 8)).toBe('6px')
    // "20px" =>20 => "4px"
    expect(moduloize('20px', 8)).toBe('4px')
  })

  it('handles "1rem" => e.g. 16 => 16%8=0 => "0px"', () => {
    // By default, MeasurementSystem sees "1rem" => 16 px => remainder=0
    expect(moduloize('1rem', 8)).toBe('0px')
  })

  it('handles "auto" in MeasurementSystem', () => {
    // "auto" => MeasurementSystem => returns unit=8 by default => remainder= 8%8=0 => "0px"
    expect(moduloize('auto', 8)).toBe('0px')
  })

  it('respects round=true in MeasurementSystem.normalize calls', () => {
    // moduloize calls: MeasurementSystem.normalize(value, { unit:1, round, ... })
    // If round=true, e.g. 10.4 => 10 => remainder= (10%8)=2 =>"2px"
    // If round=false, e.g. 10.4 => 10.4 => remainder= 2.4 => "2.4px"
    // We'll test that difference:

    // numeric input
    expect(moduloize(10.4, 8, { round: true })).toBe('2px')
    // => MeasurementSystem.normalize(10.4, { unit=1, round=true }) => ~10 => remainder=2
    expect(moduloize(10.4, 8, { round: false })).toBe('2.4px')
    // => no rounding => remainder= (10.4%8)=2.4 => "2.4px"
  })

  it('handles invalid strings by fallback to 1 unit in MeasurementSystem', () => {
    // If the string fails parse, your code returns default unit=1 from measurement
    // Then remainder=1%8=1 => "1px"
    expect(moduloize('invalid' as CSSValue, 8)).toBe('1px')
  })
})