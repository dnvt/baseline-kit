import { DEFAULT_CONFIG, mergeConfig } from '@baseline-kit/core'

describe('mergeConfig', () => {
  it('defaults diagnostics off and inherits an explicit scope setting', () => {
    const diagnosticsConfig = mergeConfig({
      parentConfig: DEFAULT_CONFIG,
      domDiagnostics: true,
    })
    const nestedDefault = mergeConfig({
      parentConfig: diagnosticsConfig,
    })

    expect(DEFAULT_CONFIG.domDiagnostics).toBe(false)
    expect(diagnosticsConfig.domDiagnostics).toBe(true)
    expect(nestedDefault.domDiagnostics).toBe(true)
  })

  it('defaults legacy parent snapshots without diagnostics to false', () => {
    const legacyParent = {
      ...DEFAULT_CONFIG,
      domDiagnostics: undefined,
    } as unknown as typeof DEFAULT_CONFIG

    expect(mergeConfig({ parentConfig: legacyParent }).domDiagnostics).toBe(
      false
    )
  })

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
