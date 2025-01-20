import { testUtils } from '@/__tests__/setup'

export const cssTestUtils = {
  // Convert relative units to pixels based on root context
  convertToPx: (value: string): number => {
    const num = parseFloat(value)
    if (value.endsWith('in')) return num * 96
    if (value.endsWith('rem')) return num * 16
    if (value.endsWith('em')) return num * 16
    if (value.endsWith('vh')) return (num / 100) * window.innerHeight
    if (value.endsWith('vw')) return (num / 100) * window.innerWidth
    if (value.endsWith('px')) return num
    return num
  },

  // Create test contexts for relative units
  createTestContext: (options: {
    viewportWidth?: number
    viewportHeight?: number
    rootFontSize?: string
    parentFontSize?: string
  }) => {
    const {
      viewportWidth = 1024,
      viewportHeight = 768,
      rootFontSize = '16px',
      parentFontSize = '16px',
    } = options

    testUtils.setViewportSize(viewportWidth, viewportHeight)
    testUtils.setRootFontSize(rootFontSize)

    return {
      parentSize: viewportWidth,
      viewportWidth,
      viewportHeight,
      rootFontSize: parseInt(rootFontSize),
      parentFontSize: parseInt(parentFontSize),
    }
  },
}
