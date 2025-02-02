import { moduloize } from '@utils'

describe('moduloize', () => {
  it('calculates CSS remainder values', () => {
    expect(moduloize(14, 8)).toBe('6px')
    expect(moduloize('14px', 8)).toBe('6px')
    expect(moduloize(-2, 8)).toBe('-2px')
    expect(moduloize(undefined, 8)).toBe('0px')
  })
})
