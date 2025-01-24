import { cx, cs, parseCSSValue } from '@utils'
import type { CSSProperties } from 'react'

describe('Style Utils', () => {
  describe('cx (combineClassNames)', () => {
    it('combines multiple class names', () => {
      expect(cx('a', 'b', 'c')).toBe('a b c')
    })

    it('filters out falsy values', () => {
      expect(cx('a', false, 'b', null, undefined, '', 'c')).toBe('a b c')
    })

    it('handles empty input', () => {
      expect(cx()).toBe('')
      expect(cx(null, false, undefined)).toBe('')
    })

    // Fixed: whitespace is handled by the join(' ') operation
    it('handles whitespace correctly', () => {
      expect(cx('a', 'b', 'c')).toBe('a b c')
      expect(cx('a  ', 'b', '  c')).toBe('a   b   c') // Preserves internal whitespace
    })
  })

  describe('cs (combineStyles)', () => {
    it('combines multiple style objects', () => {
      const style1: CSSProperties = { color: 'red', margin: '10px' }
      const style2: CSSProperties = { backgroundColor: 'blue' }
      const style3: CSSProperties = { margin: '20px' }

      expect(cs(style1, style2, style3)).toEqual({
        color: 'red',
        backgroundColor: 'blue',
        margin: '20px',
      })
    })

    it('handles custom properties', () => {
      const style1 = { '--grid-gap': '10px' } as CSSProperties
      const style2 = { '--grid-columns': '12' } as CSSProperties

      expect(cs(style1, style2)).toEqual({
        '--grid-gap': '10px',
        '--grid-columns': '12',
      })
    })

    it('filters out undefined values', () => {
      expect(cs({ color: 'red' }, undefined, { margin: '10px' })).toEqual({
        color: 'red',
        margin: '10px',
      })
    })

    it('returns empty object for no input', () => {
      expect(cs()).toEqual({})
    })
  })

  describe('parseCSSValue', () => {
    // Fixed: numeric values should match the actual implementation
    it('handles numeric values', () => {
      expect(parseCSSValue(100)).toBe('100px')
      expect(parseCSSValue(0)).toBe('0')
      expect(parseCSSValue(-100)).toBe('-100px')
    })

    it('handles special values', () => {
      expect(parseCSSValue('auto')).toBe('auto')
      expect(parseCSSValue('100%')).toBe('100%')
    })

    it('handles CSS units', () => {
      expect(parseCSSValue('100px')).toBe('100px')
      expect(parseCSSValue('1rem')).toBe('1rem')
      expect(parseCSSValue('50vh')).toBe('50vh')
      expect(parseCSSValue('1fr')).toBe('1fr')
    })

    it('handles undefined and invalid values', () => {
      expect(parseCSSValue(undefined)).toBe('0')
      // @ts-expect-error: cannot pass invalid to this function
      expect(parseCSSValue(null)).toBe('0')
      // @ts-expect-error: cannot pass invalid to this function
      expect(parseCSSValue('invalid')).toBe('invalid')
    })

    it('preserves relative and grid units', () => {
      expect(parseCSSValue('1fr')).toBe('1fr')
      expect(parseCSSValue('100%')).toBe('100%')
      expect(parseCSSValue('1rem')).toBe('1rem')
      expect(parseCSSValue('10vh')).toBe('10vh')
    })
  })
})
