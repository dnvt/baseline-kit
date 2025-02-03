import { parsePadding } from '@utils'

describe('Padding Utils - parsePadding', () => {
  it('returns zero padding when no spacing props are provided', () => {
    expect(parsePadding({})).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    })
  })

  it('parses numeric padding', () => {
    expect(parsePadding({ padding: 10 })).toEqual({
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    })
  })

  it('handles a two-element array format for padding', () => {
    expect(parsePadding({ padding: [10, 20] })).toEqual({
      top: 10,
      right: 20,
      bottom: 10,
      left: 20,
    })
  })

  it('handles a four-element array format for padding', () => {
    expect(parsePadding({ padding: [10, 20, 30, 40] })).toEqual({
      top: 10,
      right: 20,
      bottom: 30,
      left: 40,
    })
  })

  it('handles object format for padding with explicit keys', () => {
    expect(parsePadding({ padding: { top: 5, right: 15, bottom: 25, left: 35 } })).toEqual({
      top: 5,
      right: 15,
      bottom: 25,
      left: 35,
    })
  })

  it('processes block/inline props when provided as arrays', () => {
    expect(parsePadding({
      block: [10, 20],
      inline: [30, 40],
    })).toEqual({
      top: 10,
      bottom: 20,
      left: 30,
      right: 40,
    })
  })

  it('processes block/inline props when provided as numbers', () => {
    expect(parsePadding({
      block: 15,
      inline: 25,
    })).toEqual({
      top: 15,
      bottom: 15,
      left: 25,
      right: 25,
    })
  })

  it('processes block/inline props when provided as objects with start/end keys', () => {
    expect(parsePadding({
      block: { start: 5, end: 10 },
      inline: { start: 20, end: 25 },
    })).toEqual({
      top: 5,
      bottom: 10,
      left: 20,
      right: 25,
    })
  })

  it('prefers padding over block/inline when both are provided', () => {
    expect(parsePadding({
      padding: [1, 2, 3, 4],
      block: [10, 20],
      inline: 15,
    })).toEqual({
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
    })
  })
})