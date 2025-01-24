import {
  isValidGuidePattern,
  isGuideLineConfig,
  isGuideColumnConfig,
  isAutoCalculatedGuide,
} from '@utils'

describe('Validation Utils', () => {
  describe('isValidGridPattern', () => {
    it('validates valid patterns', () => {
      expect(isValidGuidePattern(['1fr', '2fr', '100px'])).toBe(true)
      expect(isValidGuidePattern(['auto', '1fr'])).toBe(true)
      expect(isValidGuidePattern(['100%'])).toBe(true)
    })

    it('rejects invalid patterns', () => {
      expect(isValidGuidePattern([])).toBe(false)
      expect(isValidGuidePattern(['invalid'])).toBe(false)
      expect(isValidGuidePattern(['1fr', null])).toBe(false)
      expect(isValidGuidePattern(null)).toBe(false)
      expect(isValidGuidePattern(undefined)).toBe(false)
      expect(isValidGuidePattern('1fr')).toBe(false)
    })
  })

  describe('Grid Config Type Guards', () => {
    it('identifies line variant config', () => {
      expect(isGuideLineConfig({ variant: 'line' })).toBe(true)
      expect(isGuideLineConfig({ variant: 'line', otherProp: true })).toBe(true)
      expect(isGuideLineConfig({ variant: 'other' })).toBe(false)
      expect(isGuideLineConfig({ columns: 12 })).toBe(false)
      expect(isGuideLineConfig(null)).toBe(false)
      expect(isGuideLineConfig({})).toBe(false)
    })

    it('identifies column config', () => {
      expect(isGuideColumnConfig({ columns: 12 })).toBe(true)
      expect(isGuideColumnConfig({ columns: ['1fr', '2fr'] })).toBe(true)
      expect(isGuideColumnConfig({ columns: 12, otherProp: true })).toBe(true)
      expect(isGuideColumnConfig({ variant: 'line' })).toBe(false)
      expect(isGuideColumnConfig({ columnWidth: '100px' })).toBe(false)
      expect(isGuideColumnConfig(null)).toBe(false)
      expect(isGuideColumnConfig({})).toBe(false)
    })

    it('identifies auto calculated grid', () => {
      expect(isAutoCalculatedGuide({ columnWidth: '100px' })).toBe(true)
      expect(isAutoCalculatedGuide({ columnWidth: 100 })).toBe(true)
      expect(isAutoCalculatedGuide({ columnWidth: '100px', otherProp: true })).toBe(true)
      expect(isAutoCalculatedGuide({ columns: 12 })).toBe(false)
      expect(isAutoCalculatedGuide({ variant: 'line' })).toBe(false)
      expect(isAutoCalculatedGuide(null)).toBe(false)
      expect(isAutoCalculatedGuide({})).toBe(false)
    })
  })
})
