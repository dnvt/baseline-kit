import { createSpacerDescriptor } from '@baseline-kit/core'

const baseParams = {
  base: 8,
  colors: { line: 'red', flat: 'blue', text: 'green' },
  variant: 'line',
  isVisible: true,
}

describe('createSpacerDescriptor', () => {
  it('rounds sizes to the base', () => {
    expect(
      createSpacerDescriptor({ ...baseParams, base: 4, height: 13 }).style[
        '--bksp-h'
      ]
    ).toBe('12px')
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

  it('falls back to 100% when width/height are omitted', () => {
    const { style, normWidth, normHeight } = createSpacerDescriptor(baseParams)
    expect(normWidth).toBe(0)
    expect(normHeight).toBe(0)
    // skipDimensions.fullSize skips emission when value is 100%
    expect(style['--bksp-w']).toBeUndefined()
    expect(style['--bksp-h']).toBeUndefined()
  })

  it('preserves explicit zero dimensions instead of treating them as omitted', () => {
    const { style } = createSpacerDescriptor({
      ...baseParams,
      width: 0,
      height: 0,
    })

    expect(style).toMatchObject({
      '--bksp-w': '0px',
      '--bksp-h': '0px',
    })
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

  it('emits configured colors for the consuming element', () => {
    const { style } = createSpacerDescriptor({
      base: 8,
      colors: { line: '#f00', flat: '#0f0', text: '#00f' },
      height: 16,
      variant: 'flat',
      isVisible: true,
    })

    expect(style).toMatchObject({
      '--bksp-cl': '#f00',
      '--bksp-cf': '#0f0',
      '--bksp-ct': '#00f',
    })
  })
})

describe('createSpacerDescriptor in plain pixels', () => {
  it('keeps fractional sizes when the base is 1', () => {
    const { style, normHeight } = createSpacerDescriptor({
      ...baseParams,
      base: 1,
      height: 3.6,
    })
    expect(normHeight).toBe(3.6)
    expect(style['--bksp-h']).toBe('3.6px')
  })
})
