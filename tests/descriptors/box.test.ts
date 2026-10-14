import {
  DEFAULT_CONFIG,
  createBoxDescriptor,
  requiresSeparatePadder,
} from '@baseline-kit/core'

const baseParams = {
  base: 8,
  lineColor: 'red',
  isVisible: true,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  paddingColor: 'blue',
}

describe('createBoxDescriptor', () => {
  it('emits the configured line color for the consuming element', () => {
    const { boxStyle } = createBoxDescriptor(baseParams)
    expect(boxStyle).toEqual({ '--bkbx-cl': 'red' })
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

  it('does not emit the unused border-base variable', () => {
    const { boxStyle } = createBoxDescriptor({
      ...baseParams,
      base: 4,
      lineColor: '#ff0',
    })
    expect(boxStyle['--bkbx-b']).toBeUndefined()
    expect(boxStyle['--bkbx-cl']).toBe('#ff0')
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

describe('requiresSeparatePadder', () => {
  it.each(['width', 'height', 'minWidth', 'maxHeight', 'boxSizing'])(
    'keeps the separate Padder for the caller layout style %s',
    (property) => {
      expect(requiresSeparatePadder({ style: { [property]: '100px' } })).toBe(
        true
      )
    }
  )

  it('keeps the merged host for paint-only style overrides', () => {
    expect(
      requiresSeparatePadder({
        style: { backgroundColor: 'red', opacity: 0.5 },
      })
    ).toBe(false)
  })

  it.each([120, '100%', '20rem'])(
    'keeps the separate Padder when Box width is explicitly %s',
    (width) => {
      expect(requiresSeparatePadder({ width })).toBe(true)
    }
  )

  it('keeps the merged host when Box width remains fit-content', () => {
    expect(requiresSeparatePadder({ width: 'fit-content' })).toBe(false)
  })

  it('keeps debug visibility out of the structural Padder decision', () => {
    expect(requiresSeparatePadder({})).toBe(false)
  })

  it('keeps the separate Padder when a caller class can change layout', () => {
    expect(requiresSeparatePadder({ className: 'custom-layout' })).toBe(true)
  })
})

describe('createBoxDescriptor shared spacing', () => {
  const padding = { top: 6, right: 0, bottom: 8, left: 4 }

  it('places inline padding as grid columns and block padding as content margins', () => {
    const { spacingStyle, contentStyle } = createBoxDescriptor({
      ...baseParams,
      padding,
    })
    expect(spacingStyle).toEqual({ gridTemplateColumns: '4px 1fr 0px' })
    // The content is the grid's only row, so every engine reads its baseline.
    expect(contentStyle).toEqual({ marginBlock: '6px 8px' })
  })

  it('emits no spacing styles for zero padding', () => {
    const zero = { top: 0, right: 0, bottom: 0, left: 0 }
    const descriptor = createBoxDescriptor({ ...baseParams, padding: zero })
    expect(descriptor.spacingStyle).toEqual({})
    expect(descriptor.contentStyle).toEqual({})
  })

  it('emits padding debug paint only when visible', () => {
    expect(
      createBoxDescriptor({ ...baseParams, padding }).paddingDebugStyle
    ).toEqual({ '--bkpd-c': 'blue', '--bkpd-is': '6px', '--bkpd-ie': '8px' })
    expect(
      createBoxDescriptor({ ...baseParams, padding, isVisible: false })
        .paddingDebugStyle
    ).toEqual({})
  })

  it('omits values the stylesheet already provides', () => {
    const { boxStyle } = createBoxDescriptor({
      ...baseParams,
      lineColor: DEFAULT_CONFIG.box.colors.line,
      flatColor: DEFAULT_CONFIG.box.colors.flat,
      width: 'fit-content',
    })
    expect(boxStyle).toEqual({})
  })
})
