import { createLayoutDescriptor, getGridTemplate } from '@baseline-kit/core'

const baseParams = {
  colors: { line: 'red', flat: 'blue', text: 'green' },
}

describe('getGridTemplate', () => {
  it('converts a number to repeat(n, 1fr)', () => {
    expect(getGridTemplate(3)).toBe('repeat(3, 1fr)')
  })

  it('passes strings through unchanged', () => {
    expect(getGridTemplate('1fr 2fr 1fr')).toBe('1fr 2fr 1fr')
  })

  it('converts an array to space-separated values, px-ifying numbers', () => {
    expect(getGridTemplate([100, '1fr', 200])).toBe('100px 1fr 200px')
  })

  it('defaults to repeat(auto-fill, minmax(100px, 1fr)) for undefined', () => {
    expect(getGridTemplate(undefined)).toBe(
      'repeat(auto-fill, minmax(100px, 1fr))'
    )
  })
})

describe('createLayoutDescriptor', () => {
  it('produces classTokens=["lay"]', () => {
    const { classTokens } = createLayoutDescriptor(baseParams)
    expect(classTokens).toEqual(['lay'])
  })

  it('emits --bkly-gtc for non-default column template', () => {
    const { containerStyle } = createLayoutDescriptor({
      ...baseParams,
      columns: 3,
    })
    expect(containerStyle['--bkly-gtc']).toBe('repeat(3, 1fr)')
  })

  it('omits --bkly-gtc when columns yields the default template', () => {
    const { containerStyle } = createLayoutDescriptor(baseParams)
    expect(containerStyle['--bkly-gtc']).toBeUndefined()
  })

  it('formats numeric gap/rowGap/columnGap with px', () => {
    const { containerStyle } = createLayoutDescriptor({
      ...baseParams,
      gap: 16,
      rowGap: 8,
      columnGap: 12,
    })
    expect(containerStyle.gap).toBe('16px')
    expect(containerStyle.rowGap).toBe('8px')
    expect(containerStyle.columnGap).toBe('12px')
  })

  it('passes through string gap values (rem, %, fr)', () => {
    const { containerStyle } = createLayoutDescriptor({
      ...baseParams,
      gap: '1rem',
    })
    expect(containerStyle.gap).toBe('1rem')
  })

  it('emits width/height CSS vars when not auto', () => {
    const { containerStyle } = createLayoutDescriptor({
      ...baseParams,
      width: 800,
      height: 600,
    })
    expect(containerStyle['--bkly-w']).toBe('800px')
    expect(containerStyle['--bkly-h']).toBe('600px')
  })

  it('skips width/height when value is auto (default)', () => {
    const { containerStyle } = createLayoutDescriptor(baseParams)
    expect(containerStyle['--bkly-w']).toBeUndefined()
    expect(containerStyle['--bkly-h']).toBeUndefined()
  })

  it('emits alignment vars when provided', () => {
    const { containerStyle } = createLayoutDescriptor({
      ...baseParams,
      justifyItems: 'center',
      alignItems: 'end',
      justifyContent: 'space-between',
      alignContent: 'stretch',
    })
    expect(containerStyle['--bkly-ji']).toBe('center')
    expect(containerStyle['--bkly-ai']).toBe('end')
    expect(containerStyle['--bkly-jc']).toBe('space-between')
    expect(containerStyle['--bkly-ac']).toBe('stretch')
  })
})
