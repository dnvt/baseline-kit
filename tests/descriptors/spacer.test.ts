import { createSpacerDescriptor } from '@baseline-kit/core'

const baseParams = {
  base: 8,
  colors: { line: 'red', flat: 'blue', text: 'green' },
  variant: 'line',
  isVisible: true,
}

describe('createSpacerDescriptor', () => {
  it('always emits --bksp-b', () => {
    const { style } = createSpacerDescriptor(baseParams)
    expect(style['--bksp-b']).toBe('8px')
  })

  it('normalizes numeric width/height against base', () => {
    // normalizeValue rounds to nearest base multiple. base=8, input 15 -> 16.
    const { normWidth, normHeight } = createSpacerDescriptor({
      ...baseParams,
      width: 15,
      height: 17,
    })
    expect(normWidth).toBe(16)
    expect(normHeight).toBe(16)
  })

  it('falls back to 100% when width/height are undefined or 0', () => {
    const { style, normWidth, normHeight } = createSpacerDescriptor(baseParams)
    expect(normWidth).toBe(0)
    expect(normHeight).toBe(0)
    // skipDimensions.fullSize skips emission when value is 100%
    expect(style['--bksp-w']).toBeUndefined()
    expect(style['--bksp-h']).toBeUndefined()
  })

  it('emits width/height CSS vars when normalized dims are non-100%', () => {
    // Use clean multiples of base=8 to avoid normalizer rounding
    const { style } = createSpacerDescriptor({
      ...baseParams,
      width: 200,
      height: 104,
    })
    expect(style['--bksp-w']).toBe('200px')
    expect(style['--bksp-h']).toBe('104px')
  })

  it('classTokens is just spr when hidden', () => {
    const tokens = createSpacerDescriptor({
      ...baseParams,
      isVisible: false,
    }).classTokens
    expect(tokens).toEqual(['spr'])
  })

  it('classTokens includes variant when visible', () => {
    expect(
      createSpacerDescriptor({ ...baseParams, variant: 'line' }).classTokens
    ).toEqual(['spr', 'line'])
    expect(
      createSpacerDescriptor({ ...baseParams, variant: 'flat' }).classTokens
    ).toEqual(['spr', 'flat'])
  })
})
