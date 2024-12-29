import {
  isValidGridColumnValue,
  isValidGridPattern,
  isGridAlignment,
  isGridLineConfig,
  isGridColumnConfig,
  isAutoCalculatedGrid,
} from '@utils'

describe('Validation Utils', () => {
  describe('isValidGridColumnValue', () => {
    it('validates grid column values', () => {
      // Valid values
      expect(isValidGridColumnValue(100)).toBe(true)
      expect(isValidGridColumnValue('100px')).toBe(true)
      expect(isValidGridColumnValue('1fr')).toBe(true)
      expect(isValidGridColumnValue('auto')).toBe(true)
      expect(isValidGridColumnValue('50%')).toBe(true)

      // Invalid values
      expect(isValidGridColumnValue('invalid')).toBe(false)
      expect(isValidGridColumnValue({})).toBe(false)
      expect(isValidGridColumnValue(null)).toBe(false)
    })
  })

  describe('isValidGridPattern', () => {
    it('validates grid patterns', () => {
      expect(isValidGridPattern(['1fr', '2fr', '100px'])).toBe(true)
      expect(isValidGridPattern(['invalid'])).toBe(false)
      expect(isValidGridPattern(null)).toBe(false)
    })
  })

  describe('isGridAlignment', () => {
    it('validates grid alignments', () => {
      expect(isGridAlignment('start')).toBe(true)
      expect(isGridAlignment('invalid')).toBe(false)
    })
  })

  describe('Grid Config Type Guards', () => {
    it('identifies line variant config', () => {
      expect(isGridLineConfig({ variant: 'line' })).toBe(true)
      expect(isGridLineConfig({ columns: 12 })).toBe(false)
    })

    it('identifies column config', () => {
      expect(isGridColumnConfig({ columns: 12 })).toBe(true)
      expect(isGridColumnConfig({ variant: 'line' })).toBe(false)
    })

    it('identifies auto calculated grid', () => {
      expect(isAutoCalculatedGrid({ columnWidth: '100px' })).toBe(true)
      expect(isAutoCalculatedGrid({ columns: 12 })).toBe(false)
    })
  })
})
