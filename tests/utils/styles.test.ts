import { cx, cs, formatValue } from '@utils'

describe('Style Utils', () => {
  describe('cx', () => {
    it('combines classnames', () => {
      expect(cx('a', false, 'b')).toBe('a b')
    })
  })

  describe('cs', () => {
    it('merges style objects', () => {
      expect(cs({ color: 'red' }, { margin: 8 })).toEqual({
        color: 'red',
        margin: 8,
      })
    })
  })

  describe('formatValue', () => {
    it('formats CSS values', () => {
      expect(formatValue(16)).toBe('16px')
      expect(formatValue('1fr')).toBe('1fr')
      expect(formatValue('auto')).toBe('auto')
    })
  })
})
