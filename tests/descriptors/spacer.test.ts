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

  describe('string sizes', () => {
    const styleOf = (params: object) =>
      createSpacerDescriptor({ ...baseParams, ...params }).style

    it('rounds a CSS length height to the base in CSS and keeps the px fallback', () => {
      expect(styleOf({ height: '1.3rem' })).toMatchObject({
        // 7.0's value against a 16px root: 20.8 -> 24.
        '--bksp-h': '24px',
        '--bksp-hl': 'round(nearest, 1.3rem, 8px)',
      })
      expect(styleOf({ height: 'calc(100% - 23px)' })['--bksp-hl']).toBe(
        'round(nearest, calc(100% - 23px), 8px)'
      )
    })

    it('rounds to a rem base in rem, and passes through at base 1', () => {
      expect(
        styleOf({ height: '1.3rem', base: 10, baseRem: 0.5 })['--bksp-hl']
      ).toBe('round(nearest, 1.3rem, 0.5rem)')
      expect(styleOf({ height: '3rem', base: 1 })['--bksp-hl']).toBe('3rem')
    })

    it("keeps 7.0's base fallback for strings CSS could drop", () => {
      for (const height of [
        'auto',
        '24',
        'min-content',
        'calc(oops)',
        // Unset, --a would substitute 2: no height.
        'var(--a, 2)',
      ]) {
        const style = styleOf({ height })
        expect(style['--bksp-h'], height).toBe('8px')
        expect(style['--bksp-hl'], height).toBeUndefined()
      }
    })

    it('renders a CSS length width as written; numbers still round', () => {
      expect(styleOf({ width: '100%' })['--bksp-w']).toBe('100%')
      expect(styleOf({ width: 'calc(50% - 4px)' })['--bksp-w']).toBe(
        'calc(50% - 4px)'
      )
      expect(styleOf({ width: 30 })['--bksp-w']).toBe('32px')
      expect(styleOf({ width: 'auto' })['--bksp-w']).toBe('8px')
    })

    it('adds nothing for numeric heights', () => {
      expect(styleOf({ height: 20 })['--bksp-hl']).toBeUndefined()
    })
  })
})
