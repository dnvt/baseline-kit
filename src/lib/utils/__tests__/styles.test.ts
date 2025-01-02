import { cx, cs, parseCSSValue } from '@utils'
import { CSSProperties } from 'react'

describe('Style Utils', () => {
  describe('combineClassNames', () => {
    it('combines class names correctly', () => {
      expect(cx('a', 'b', 'c')).toBe('a b c')
      expect(cx('a', false, 'b', null, undefined)).toBe('a b')
      expect(cx()).toBe('')
    })
  })

  describe('combineStyles', () => {
    it('combines style objects', () => {
      type TestStyle = Partial<CSSProperties>

      const style1: TestStyle = { color: 'red', '--grid-custom-prop': '10px' }
      const style2: TestStyle = { background: 'blue' }

      expect(cs(style1, style2)).toEqual({
        color: 'red',
        '--grid-custom-prop': '10px',
        background: 'blue',
      })
    })

    it('handles undefined styles', () => {
      expect(cs({ color: 'red' }, undefined)).toEqual({ color: 'red' })
    })
  })

  describe('parseGridValue', () => {
    it('parses grid values correctly', () => {
      expect(parseCSSValue(100)).toBe('100px')
      expect(parseCSSValue('100px')).toBe('100px')
      expect(parseCSSValue('auto')).toBe('auto')
    })
  })
})
