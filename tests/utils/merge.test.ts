import { mergeClasses, mergeStyles } from '@utils'
import type { CSSProperties } from 'react'

describe('Merge Utilities', () => {
  describe('merge classes', () => {
    it('combines class names and filters out falsy values', () => {
      expect(mergeClasses('foo', 'bar')).toBe('foo bar')
      expect(mergeClasses('foo', false, 'bar', undefined, null, 'baz')).toBe('foo bar baz')
    })

    it('returns an empty string when all values are falsy', () => {
      expect(mergeClasses(false, undefined, null, '')).toBe('')
    })

    it('trims the resulting string (removing leading and trailing spaces) while preserving inner spaces', () => {
      // Given that inner spaces are preserved, '  foo  ' and 'bar' yield "foo   bar"
      expect(mergeClasses('  foo  ', 'bar')).toBe('foo   bar')
    })
  })

  describe('merge styles', () => {
    it('merges multiple style objects into one', () => {
      const style1: CSSProperties = { color: 'red', fontSize: '12px' }
      const style2: CSSProperties = { backgroundColor: 'blue', fontWeight: 'bold' }
      const result = mergeStyles(style1, style2)
      expect(result).toEqual({
        color: 'red',
        fontSize: '12px',
        backgroundColor: 'blue',
        fontWeight: 'bold',
      })
    })

    it('overrides properties from earlier objects with later ones', () => {
      const style1: CSSProperties = { color: 'red', fontSize: '12px' }
      const style2: CSSProperties = { color: 'blue' }
      const result = mergeStyles(style1, style2)
      expect(result).toEqual({
        color: 'blue',
        fontSize: '12px',
      })
    })

    it('ignores undefined style objects', () => {
      const style1: CSSProperties = { color: 'red' }
      const style2: CSSProperties = { fontSize: '14px' }
      const result = mergeStyles(style1, undefined, style2)
      expect(result).toEqual({
        color: 'red',
        fontSize: '14px',
      })
    })

    it('returns an empty object when no styles are provided', () => {
      const result = mergeStyles()
      expect(result).toEqual({})
    })
  })
})