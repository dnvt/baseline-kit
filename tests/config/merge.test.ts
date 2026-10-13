import {
  DEFAULT_CONFIG,
  mergeConfig,
  parseRemBase,
  resolveConfigBase,
} from '@baseline-kit/core'

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

describe('rem base', () => {
  it('resolves against 16px by default, or the given root size', () => {
    expect(
      mergeConfig({ parentConfig: DEFAULT_CONFIG, base: '0.5rem' })
    ).toMatchObject({ base: 8, baseRem: 0.5 })
    expect(
      mergeConfig({
        parentConfig: DEFAULT_CONFIG,
        base: '0.5rem',
        rootFontSize: 17,
      })
    ).toMatchObject({ base: 8.5, baseRem: 0.5 })
  })

  it('passes the resolved base down, and a px base replaces it', () => {
    const rem = mergeConfig({
      parentConfig: DEFAULT_CONFIG,
      base: '0.5rem',
      rootFontSize: 20,
    })
    expect(mergeConfig({ parentConfig: rem })).toMatchObject({
      base: 10,
      baseRem: 0.5,
    })
    const px = mergeConfig({ parentConfig: rem, base: 4 })
    expect(px.base).toBe(4)
    expect('baseRem' in px).toBe(false)
  })

  it('keeps px configs free of baseRem and warns once about an invalid base', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect('baseRem' in mergeConfig({ parentConfig: DEFAULT_CONFIG })).toBe(
      false
    )
    const parent = mergeConfig({ parentConfig: DEFAULT_CONFIG, base: 12 })
    for (const base of ['8px', '0rem', '-1rem', 'rem', '8px']) {
      const merged = mergeConfig({ parentConfig: parent, base: base as never })
      expect(merged.base).toBe(12)
      expect('baseRem' in merged).toBe(false)
    }
    expect(warn).toHaveBeenCalledTimes(4)
    expect(warn.mock.calls[0][0]).toContain('"8px"')
    warn.mockRestore()
  })

  it('parses rem bases and resolves them against a root size', () => {
    expect(parseRemBase('0.5rem')).toBe(0.5)
    expect(parseRemBase(' 1.25rem ')).toBe(1.25)
    // Every form TypeScript's `${number}rem` accepts.
    expect(parseRemBase('.5rem')).toBe(0.5)
    expect(parseRemBase('1.rem')).toBe(1)
    expect(parseRemBase('+0.5rem')).toBe(0.5)
    expect(parseRemBase('1e-1rem')).toBe(0.1)
    expect(parseRemBase('0.5 rem')).toBe(0.5)
    expect(parseRemBase('0.5\trem')).toBe(0.5)
    for (const base of [
      8,
      '8',
      '8px',
      '0rem',
      '-1rem',
      '1em',
      'Infinityrem',
      undefined,
    ]) {
      expect(parseRemBase(base)).toBeUndefined()
    }

    const rem = mergeConfig({ parentConfig: DEFAULT_CONFIG, base: '0.5rem' })
    expect(resolveConfigBase(DEFAULT_CONFIG, 20)).toBe(DEFAULT_CONFIG)
    expect(resolveConfigBase(rem, 16)).toBe(rem)
    expect(resolveConfigBase(rem, 24)).toMatchObject({ base: 12, baseRem: 0.5 })
  })
})
