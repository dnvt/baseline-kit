import { createBaselineDescriptor } from '@baseline-kit/core'

const baseParams = {
  base: 8,
  colors: { line: 'red', flat: 'blue' },
  variant: 'line' as const,
  containerWidth: 400,
  containerHeight: 160,
  spacing: {},
  isVisible: true,
}

describe('createBaselineDescriptor', () => {
  it('computes rowCount from container height and base', () => {
    const { rowCount } = createBaselineDescriptor(baseParams)
    expect(rowCount).toBeGreaterThan(0)
    // 160 / 8 = 20 rows
    expect(rowCount).toBe(20)
  })

  it('returns getRowStyle that spaces rows by base', () => {
    const { getRowStyle } = createBaselineDescriptor(baseParams)
    expect(getRowStyle(0)).toEqual({
      '--bkbl-rt': '0px',
      '--bkbl-rh': '1px',
    })
    expect(getRowStyle(5)).toEqual({
      '--bkbl-rt': '40px', // 5 * 8
      '--bkbl-rh': '1px',
    })
  })

  it('emits row height of base for flat variant', () => {
    const { getRowStyle } = createBaselineDescriptor({
      ...baseParams,
      variant: 'flat',
    })
    const style = getRowStyle(1)
    expect(style['--bkbl-rh']).toBe('8px')
  })

  it('honors explicit color override', () => {
    const { getRowStyle } = createBaselineDescriptor({
      ...baseParams,
      color: '#abc',
    })
    expect(
      createBaselineDescriptor({ ...baseParams, color: '#abc' }).containerStyle[
        '--bkbl-cl'
      ]
    ).toBe('#abc')
  })

  it('emits configured paint channels on the consuming element', () => {
    const { containerStyle } = createBaselineDescriptor(baseParams)
    expect(containerStyle['--bkbl-cl']).toBe('red')
    expect(containerStyle['--bkbl-cf']).toBe('blue')
    expect(containerStyle['--bkbl-c']).toBe('var(--bkbl-cl)')
  })

  it('classTokens uses v/h for visibility', () => {
    expect(createBaselineDescriptor(baseParams).classTokens).toEqual([
      'bas',
      'v',
    ])
    expect(
      createBaselineDescriptor({ ...baseParams, isVisible: false }).classTokens
    ).toEqual(['bas', 'h'])
  })

  it('emits padding string when spacing is non-zero', () => {
    const { padding } = createBaselineDescriptor({
      ...baseParams,
      spacing: { padding: [8, 16, 8, 16] },
    })
    expect(padding).toBe('8px 16px 8px 16px')
  })

  it('leaves padding undefined when spacing is empty/zero', () => {
    const { padding } = createBaselineDescriptor(baseParams)
    expect(padding).toBeUndefined()
  })

  it('uses the measured height when height is a relative CSS value', () => {
    expect(
      createBaselineDescriptor({
        ...baseParams,
        height: '100%',
        containerHeight: 160,
      }).rowCount
    ).toBe(20)

    expect(
      createBaselineDescriptor({
        ...baseParams,
        height: '100vh',
        containerHeight: 160,
      }).rowCount
    ).toBe(20)
  })

  it('uses measured layout rather than normalizing a declared pixel height', () => {
    expect(
      createBaselineDescriptor({
        ...baseParams,
        base: 10,
        height: '100px',
        containerHeight: 94,
      }).rowCount
    ).toBe(9)
  })

  it.each([
    ['50%', '50%'],
    ['100%', '100%'],
    ['100vh', '100vh'],
    ['100vw', '100vw'],
    ['100dvh', '100dvh'],
    ['10rem', '10rem'],
    ['10em', '10em'],
    ['calc(100% - 1rem)', 'calc(100% - 1rem)'],
    [160, '160px'],
    [0, '0px'],
  ] as const)('preserves explicit CSS height %s', (height, expected) => {
    const { containerStyle } = createBaselineDescriptor({
      ...baseParams,
      height,
    })

    expect(containerStyle['--bkbl-h']).toBe(expected)
  })

  it.each([
    ['50%', '50%'],
    ['100vw', '100vw'],
    ['calc(100% - 1rem)', 'calc(100% - 1rem)'],
    [160, '160px'],
    [0, '0px'],
  ] as const)('preserves explicit CSS width %s', (width, expected) => {
    const { containerStyle } = createBaselineDescriptor({
      ...baseParams,
      width,
    })

    expect(containerStyle['--bkbl-w']).toBe(expected)
  })

  it('leaves omitted dimensions to the stylesheet defaults', () => {
    const { containerStyle } = createBaselineDescriptor(baseParams)

    expect(containerStyle['--bkbl-w']).toBeUndefined()
    expect(containerStyle['--bkbl-h']).toBeUndefined()
  })
})
