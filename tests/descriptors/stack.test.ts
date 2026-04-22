import { createStackDescriptor } from '@baseline-kit/core'

const baseParams = {
  colors: { line: 'red', flat: 'blue', text: 'green' },
  direction: 'row',
  justify: 'flex-start',
  align: 'flex-start',
  isVisible: true,
}

describe('createStackDescriptor gap handling', () => {
  it('emits px units for numeric gap', () => {
    const { containerStyle } = createStackDescriptor({ ...baseParams, gap: 8 })
    expect(containerStyle.rowGap).toBe('8px')
    expect(containerStyle.columnGap).toBe('8px')
  })

  it('emits px units for numeric rowGap and columnGap', () => {
    const { containerStyle } = createStackDescriptor({
      ...baseParams,
      rowGap: 12,
      columnGap: 4,
    })
    expect(containerStyle.rowGap).toBe('12px')
    expect(containerStyle.columnGap).toBe('4px')
  })

  it('omits gap keys when none are provided', () => {
    const { containerStyle } = createStackDescriptor(baseParams)
    expect(containerStyle.rowGap).toBeUndefined()
    expect(containerStyle.columnGap).toBeUndefined()
  })
})
