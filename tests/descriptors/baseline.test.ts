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
      '--bkbl-c': 'red',
    })
    expect(getRowStyle(5)).toEqual({
      '--bkbl-rt': '40px', // 5 * 8
      '--bkbl-rh': '1px',
      '--bkbl-c': 'red',
    })
  })

  it('emits row height of base for flat variant', () => {
    const { getRowStyle } = createBaselineDescriptor({
      ...baseParams,
      variant: 'flat',
    })
    const style = getRowStyle(1)
    expect(style['--bkbl-rh']).toBe('8px')
    expect(style['--bkbl-c']).toBe('blue')
  })

  it('honors explicit color override', () => {
    const { getRowStyle } = createBaselineDescriptor({
      ...baseParams,
      color: '#abc',
    })
    expect(getRowStyle(0)['--bkbl-c']).toBe('#abc')
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
})
