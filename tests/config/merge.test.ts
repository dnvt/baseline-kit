import { DEFAULT_CONFIG, mergeConfig } from '@baseline-kit/core'

describe('mergeConfig', () => {
  it('preserves inherited color channels when a scope overrides one channel', () => {
    const result = mergeConfig({
      parentConfig: DEFAULT_CONFIG,
      guide: {
        colors: {
          ...DEFAULT_CONFIG.guide.colors,
          line: '#ff0000',
        },
      },
    })

    expect(result.guide.colors.line).toBe('#ff0000')
    expect(result.guide.colors.pattern).toBe(
      DEFAULT_CONFIG.guide.colors.pattern
    )
  })
})
