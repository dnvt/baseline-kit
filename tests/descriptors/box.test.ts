import { createBoxDescriptor } from '@baseline-kit/core'

const baseParams = {
  base: 8,
  lineColor: 'red',
  isVisible: true,
}

describe('createBoxDescriptor', () => {
  it('omits CSS vars that match defaults', () => {
    // base=8 matches BOX_DEFAULTS, lineColor=red matches -> empty override
    const { boxStyle } = createBoxDescriptor(baseParams)
    expect(boxStyle).toEqual({})
  })

  it('emits width/height CSS vars with px for numeric overrides', () => {
    const { boxStyle } = createBoxDescriptor({
      ...baseParams,
      width: 120,
      height: 80,
    })
    expect(boxStyle['--bkbx-w']).toBe('120px')
    expect(boxStyle['--bkbx-h']).toBe('80px')
  })

  it('passes through string dimensions unchanged', () => {
    const { boxStyle } = createBoxDescriptor({
      ...baseParams,
      width: '50%',
      height: '10rem',
    })
    expect(boxStyle['--bkbx-w']).toBe('50%')
    expect(boxStyle['--bkbx-h']).toBe('10rem')
  })

  it('does not emit base/color overrides (defaults mirror inputs)', () => {
    // BOX_DEFAULTS is parameterized by the same base/lineColor passed to
    // createStyleOverride, so value === default and the override is skipped.
    // Styling for these vars happens at the CSS layer, not via inline style.
    const { boxStyle } = createBoxDescriptor({
      ...baseParams,
      base: 4,
      lineColor: '#ff0',
    })
    expect(boxStyle['--bkbx-b']).toBeUndefined()
    expect(boxStyle['--bkbx-cl']).toBeUndefined()
  })

  it('adds visibility token when isVisible', () => {
    expect(createBoxDescriptor(baseParams).classTokens).toEqual(['box', 'v'])
    expect(
      createBoxDescriptor({ ...baseParams, isVisible: false }).classTokens
    ).toEqual(['box'])
  })

  it('emits grid span styles for span prop', () => {
    const { gridSpanStyle } = createBoxDescriptor({ ...baseParams, span: 3 })
    expect(gridSpanStyle).toEqual({
      gridColumn: 'span 3',
      gridRow: 'span 3',
    })
  })

  it('emits independent col/row span when span is not set', () => {
    const { gridSpanStyle } = createBoxDescriptor({
      ...baseParams,
      colSpan: 2,
      rowSpan: 4,
    })
    expect(gridSpanStyle).toEqual({
      gridColumn: 'span 2',
      gridRow: 'span 4',
    })
  })

  it('returns empty gridSpanStyle when no span props', () => {
    const { gridSpanStyle } = createBoxDescriptor(baseParams)
    expect(gridSpanStyle).toEqual({})
  })
})
