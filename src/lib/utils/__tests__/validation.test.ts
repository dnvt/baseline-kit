import {
  isValidGridColumnValue,
  isValidGridPattern,
  isGridLineConfig,
  isGridColumnConfig,
  isAutoCalculatedGrid,
} from '@utils'

describe('Validation Utils', () => {
  describe('isValidGridColumnValue', () => {
    it('validates numeric values', () => {
      // Valid numbers: finite and non-negative
      expect(isValidGridColumnValue(100)).toBe(true)
      expect(isValidGridColumnValue(0)).toBe(true)
      expect(isValidGridColumnValue(1.5)).toBe(true)

      // Invalid numbers
      expect(isValidGridColumnValue(-100)).toBe(false) // Negative numbers not allowed
      expect(isValidGridColumnValue(Infinity)).toBe(false) // Infinity not allowed
      expect(isValidGridColumnValue(-Infinity)).toBe(false) // Negative infinity not allowed
      expect(isValidGridColumnValue(NaN)).toBe(false) // NaN not allowed
    })

    it('validates string values with units', () => {
      // Valid units with support for decimals
      expect(isValidGridColumnValue('100px')).toBe(true)
      expect(isValidGridColumnValue('1.5rem')).toBe(true)
      expect(isValidGridColumnValue('0.5fr')).toBe(true)
      expect(isValidGridColumnValue('50%')).toBe(true)
      expect(isValidGridColumnValue('10.5vh')).toBe(true)
      expect(isValidGridColumnValue('.8em')).toBe(true)

      // Invalid formats
      expect(isValidGridColumnValue('-100px')).toBe(false) // Negative not allowed
      expect(isValidGridColumnValue('px100')).toBe(false)
      expect(isValidGridColumnValue('100')).toBe(false)
      expect(isValidGridColumnValue('100xyz')).toBe(false)
      expect(isValidGridColumnValue('abc')).toBe(false)
    })

    it('validates special values', () => {
      expect(isValidGridColumnValue('auto')).toBe(true)
      expect(isValidGridColumnValue('100%')).toBe(true)
    })

    it('rejects invalid values', () => {
      expect(isValidGridColumnValue('invalid')).toBe(false)
      expect(isValidGridColumnValue({})).toBe(false)
      expect(isValidGridColumnValue([])).toBe(false)
      expect(isValidGridColumnValue(null)).toBe(false)
      expect(isValidGridColumnValue(undefined)).toBe(false)
    })
  })

  // Rest of the tests remain the same...
  describe('isValidGridPattern', () => {
    it('validates valid patterns', () => {
      expect(isValidGridPattern(['1fr', '2fr', '100px'])).toBe(true)
      expect(isValidGridPattern(['auto', '1fr'])).toBe(true)
      expect(isValidGridPattern(['100%'])).toBe(true)
    })

    it('rejects invalid patterns', () => {
      expect(isValidGridPattern([])).toBe(false)
      expect(isValidGridPattern(['invalid'])).toBe(false)
      expect(isValidGridPattern(['1fr', null])).toBe(false)
      expect(isValidGridPattern(null)).toBe(false)
      expect(isValidGridPattern(undefined)).toBe(false)
      expect(isValidGridPattern('1fr')).toBe(false)
    })
  })

  describe('Grid Config Type Guards', () => {
    it('identifies line variant config', () => {
      expect(isGridLineConfig({ variant: 'line' })).toBe(true)
      expect(isGridLineConfig({ variant: 'line', otherProp: true })).toBe(true)
      expect(isGridLineConfig({ variant: 'other' })).toBe(false)
      expect(isGridLineConfig({ columns: 12 })).toBe(false)
      expect(isGridLineConfig(null)).toBe(false)
      expect(isGridLineConfig({})).toBe(false)
    })

    it('identifies column config', () => {
      expect(isGridColumnConfig({ columns: 12 })).toBe(true)
      expect(isGridColumnConfig({ columns: ['1fr', '2fr'] })).toBe(true)
      expect(isGridColumnConfig({ columns: 12, otherProp: true })).toBe(true)
      expect(isGridColumnConfig({ variant: 'line' })).toBe(false)
      expect(isGridColumnConfig({ columnWidth: '100px' })).toBe(false)
      expect(isGridColumnConfig(null)).toBe(false)
      expect(isGridColumnConfig({})).toBe(false)
    })

    it('identifies auto calculated grid', () => {
      expect(isAutoCalculatedGrid({ columnWidth: '100px' })).toBe(true)
      expect(isAutoCalculatedGrid({ columnWidth: 100 })).toBe(true)
      expect(isAutoCalculatedGrid({ columnWidth: '100px', otherProp: true })).toBe(true)
      expect(isAutoCalculatedGrid({ columns: 12 })).toBe(false)
      expect(isAutoCalculatedGrid({ variant: 'line' })).toBe(false)
      expect(isAutoCalculatedGrid(null)).toBe(false)
      expect(isAutoCalculatedGrid({})).toBe(false)
    })
  })
})
