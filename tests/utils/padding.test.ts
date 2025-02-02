import { parsePadding } from '@utils'

describe('Padding Utils', () => {
  it('parses numeric padding', () => {
    expect(parsePadding({ padding: 10 })).toEqual({
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    })
  })

  it('handles array formats', () => {
    expect(parsePadding({ padding: [10, 20] })).toEqual({
      top: 10,
      right: 20,
      bottom: 10,
      left: 20,
    })
  })

  it('processes block/inline props', () => {
    expect(parsePadding({
      block: [10, 20],
      inline: 15,
    })).toEqual({
      top: 10,
      bottom: 20,
      left: 15,
      right: 15,
    })
  })
})
