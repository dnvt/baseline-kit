import { extractPadd } from '@utils'

// Helper to simplify test calls
function testEdges(
  spacing: any,
  expected: { top: number; right: number; bottom: number; left: number },
) {
  expect(extractPadd(spacing)).toEqual(expected)
}

describe('extractPadd', () => {
  it('returns all zero when no relevant props', () => {
    testEdges({}, { top: 0, right: 0, bottom: 0, left: 0 })
  })

  it('parses single numeric padding => all edges same', () => {
    testEdges(
      { padding: 16 },
      { top: 16, right: 16, bottom: 16, left: 16 },
    )
  })

  it('parses padding array of length 2 => [block, inline]', () => {
    testEdges(
      { padding: [10, 20] },
      { top: 10, right: 20, bottom: 10, left: 20 },
    )
  })

  it('parses padding array of length >= 4 => [top, right, bottom, left]', () => {
    testEdges(
      { padding: [5, 10, 15, 20] },
      { top: 5, right: 10, bottom: 15, left: 20 },
    )

    // If there's a 5th item in the array, it just ignores it.
    testEdges(
      { padding: [5, 10, 15, 20, 999] },
      { top: 5, right: 10, bottom: 15, left: 20 },
    )
  })

  it('parses padding object => { top, right, bottom, left }', () => {
    testEdges(
      { padding: { top: 1, right: 2, bottom: 3, left: 4 } },
      { top: 1, right: 2, bottom: 3, left: 4 },
    )

    // Missing keys => 0
    testEdges(
      { padding: { top: 10 } },
      { top: 10, right: 0, bottom: 0, left: 0 },
    )
  })

  it('ignores block/inline if padding is defined', () => {
    testEdges(
      { padding: 20, block: 50, inline: 50 },
      { top: 20, right: 20, bottom: 20, left: 20 }, // from padding
    )
  })

  it('parses block/inline if no padding prop is present', () => {
    testEdges(
      { block: 40, inline: 10 },
      { top: 40, right: 10, bottom: 40, left: 10 },
    )
  })

  it('parses block as array => [top, bottom], inline as number => left/right', () => {
    testEdges(
      { block: [12, 24], inline: 8 },
      { top: 12, right: 8, bottom: 24, left: 8 },
    )
  })

  it('parses block as object => { start, end }, inline as object => { start, end }', () => {
    testEdges(
      {
        block: { start: 5, end: 15 },
        inline: { start: 10, end: 20 },
      },
      { top: 5, right: 20, bottom: 15, left: 10 },
    )
  })

  it('handles partial definitions in block/inline arrays or objects', () => {
    // block array => [top, bottom], but second is missing => default 0
    testEdges(
      { block: [30], inline: [4] },
      { top: 30, right: 0, bottom: 0, left: 4 },
    )

    // block object => { start: number; end?: number } => end is missing
    testEdges(
      { block: { start: 25 }, inline: { start: 2 } },
      { top: 25, right: 0, bottom: 0, left: 2 },
    )
  })
})