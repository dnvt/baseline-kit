import { createPadderDescriptor } from '@baseline-kit/core'

const baseParams = {
  base: 8,
  color: 'blue',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  enableSpacers: false,
  isVisible: true,
}

describe('createPadderDescriptor', () => {
  it('emits --bkpd-b and --bkpd-c unconditionally', () => {
    const { containerStyle } = createPadderDescriptor(baseParams)
    expect(containerStyle['--bkpd-b']).toBe('8px')
    expect(containerStyle['--bkpd-c']).toBe('blue')
  })

  it('emits width/height only when not fit-content', () => {
    const withDims = createPadderDescriptor({
      ...baseParams,
      width: 100,
      height: 50,
    })
    expect(withDims.containerStyle['--bkpd-w']).toBe('100px')
    expect(withDims.containerStyle['--bkpd-h']).toBe('50px')

    const fitContent = createPadderDescriptor({
      ...baseParams,
      width: 'fit-content',
      height: 'fit-content',
    })
    expect(fitContent.containerStyle['--bkpd-w']).toBeUndefined()
    expect(fitContent.containerStyle['--bkpd-h']).toBeUndefined()

    const undef = createPadderDescriptor(baseParams)
    expect(undef.containerStyle['--bkpd-w']).toBeUndefined()
    expect(undef.containerStyle['--bkpd-h']).toBeUndefined()
  })

  it('emits paddingBlock/paddingInline when enableSpacers=false and padding > 0', () => {
    const { containerStyle } = createPadderDescriptor({
      ...baseParams,
      padding: { top: 8, right: 16, bottom: 24, left: 4 },
    })
    expect(containerStyle.paddingBlock).toBe('8px 24px')
    expect(containerStyle.paddingInline).toBe('4px 16px')
  })

  it('omits paddingBlock when top and bottom are 0', () => {
    const { containerStyle } = createPadderDescriptor({
      ...baseParams,
      padding: { top: 0, right: 8, bottom: 0, left: 8 },
    })
    expect(containerStyle.paddingBlock).toBeUndefined()
    expect(containerStyle.paddingInline).toBe('8px 8px')
  })

  it('skips padding styles when enableSpacers=true (spacers handle it)', () => {
    const { containerStyle } = createPadderDescriptor({
      ...baseParams,
      enableSpacers: true,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
    })
    expect(containerStyle.paddingBlock).toBeUndefined()
    expect(containerStyle.paddingInline).toBeUndefined()
  })

  it('includes "v" class token only when visible AND spacers enabled', () => {
    expect(
      createPadderDescriptor({ ...baseParams, enableSpacers: true })
        .classTokens
    ).toEqual(['pad', 'v'])
    expect(
      createPadderDescriptor({ ...baseParams, enableSpacers: false })
        .classTokens
    ).toEqual(['pad'])
    expect(
      createPadderDescriptor({
        ...baseParams,
        enableSpacers: true,
        isVisible: false,
      }).classTokens
    ).toEqual(['pad'])
  })
})
