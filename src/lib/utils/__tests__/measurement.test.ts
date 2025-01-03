import { MeasurementSystem } from '@utils'
import { COMPONENTS as CONFIG } from '@config'
import { CSSValue } from '@types'

describe('MeasurementSystem', () => {
  const originalWindow = global.window
  const originalDocument = global.document

  beforeEach(() => {
    // Mock window
    global.window = {
      ...originalWindow,
      innerWidth: 1024,
      innerHeight: 768,
    } as typeof window

    // Mock document
    global.document = {
      ...originalDocument,
      documentElement: {
        style: { fontSize: '16px' },
      },
      body: {
        style: { fontSize: '16px' },
      },
    } as typeof document

    // Mock getComputedStyle
    global.getComputedStyle = vi.fn().mockImplementation((element: HTMLElement) => ({
      fontSize: element === document.documentElement ? '16px' : '16px',
    }))

    // Mock console methods
    console.warn = vi.fn()
    console.error = vi.fn()
  })

  afterEach(() => {
    global.window = originalWindow
    global.document = originalDocument
    vi.clearAllMocks()
  })

  describe('normalize', () => {
    it('normalizes numeric values to base unit multiples', () => {
      expect(MeasurementSystem.normalize(100)).toBe(104) // Rounds to nearest 8
      expect(MeasurementSystem.normalize(95)).toBe(96)
      expect(MeasurementSystem.normalize(94)).toBe(96)
    })

    it('handles auto value', () => {
      expect(MeasurementSystem.normalize('auto')).toBe(CONFIG.baseUnit)
    })

    it('normalizes relative units', () => {
      // 10% of viewport height (768px) = 76.8px, rounded to nearest 8 = 80
      expect(MeasurementSystem.normalize('10vh')).toBe(80)
      // 10% of viewport width (1024px) = 102.4px, rounded to nearest 8 = 104
      expect(MeasurementSystem.normalize('10vw')).toBe(104)
      // 1rem = 16px, already a multiple of 8
      expect(MeasurementSystem.normalize('1rem')).toBe(16)
    })

    it('handles invalid inputs', () => {
      // Test invalid string input
      expect(MeasurementSystem.normalize('invalid' as CSSValue)).toBe(CONFIG.baseUnit)
    })

    it('handles NaN input', () => {
      const result = MeasurementSystem.normalize(NaN)
      expect(result).toBe(NaN)
    })

    it('respects custom unit size', () => {
      expect(MeasurementSystem.normalize(100, { unit: 4 })).toBe(100)
      expect(MeasurementSystem.normalize('96px', { unit: 4 })).toBe(96)
    })

    it('suppresses warnings when requested', () => {
      MeasurementSystem.normalize(95, { suppressWarnings: true })
      expect(console.warn).not.toHaveBeenCalled()
    })
  })

  describe('isNormalized', () => {
    it('checks if values are multiples of base unit', () => {
      expect(MeasurementSystem.isNormalized(96)).toBe(true)
      expect(MeasurementSystem.isNormalized(95)).toBe(false)
    })

    it('handles auto value', () => {
      expect(MeasurementSystem.isNormalized('auto')).toBe(true)
    })

    it('checks CSS units', () => {
      expect(MeasurementSystem.isNormalized('96px')).toBe(true)
      expect(MeasurementSystem.isNormalized('95px')).toBe(false)
    })

    it('respects custom unit size', () => {
      expect(MeasurementSystem.isNormalized(95, { unit: 5 })).toBe(true)
      expect(MeasurementSystem.isNormalized('95px', { unit: 5 })).toBe(true)
    })
  })
})
