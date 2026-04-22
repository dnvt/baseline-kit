import { createGuideDescriptor, createGuideConfig } from '@baseline-kit/core'

const baseParams = {
  base: 8,
  colors: { line: 'red', pattern: 'green', fixed: 'blue', auto: 'orange' },
  variant: 'line' as const,
  align: 'center',
  containerWidth: 1024,
  containerHeight: 768,
  template: 'repeat(48, 1px)',
  columnsCount: 48,
  calculatedGap: 7,
  isVisible: true,
}

describe('createGuideConfig', () => {
  it('builds a line config', () => {
    expect(createGuideConfig({ variant: 'line', base: 8, gap: 8 })).toEqual({
      variant: 'line',
      gap: 8,
      base: 8,
    })
  })

  it('builds a pattern config when columns is an array', () => {
    const config = createGuideConfig({
      variant: 'pattern',
      base: 8,
      gap: 16,
      columns: ['1fr', '2fr', '1fr'],
    })
    expect(config).toEqual({
      variant: 'pattern',
      columns: ['1fr', '2fr', '1fr'],
      gap: 16,
      base: 8,
    })
  })

  it('builds a fixed config with parsed columns', () => {
    expect(
      createGuideConfig({ variant: 'fixed', base: 8, gap: 8, columns: 6 })
    ).toEqual({
      variant: 'fixed',
      columns: 6,
      columnWidth: '60px',
      gap: 8,
      base: 8,
    })
  })

  it('falls back to auto when pattern lacks columns array', () => {
    const config = createGuideConfig({ variant: 'pattern', base: 8, gap: 8 })
    expect(config.variant).toBe('auto')
  })

  it('falls back to auto when fixed has invalid columns', () => {
    const config = createGuideConfig({ variant: 'fixed', base: 8, gap: 8 })
    expect(config.variant).toBe('auto')
  })
})

describe('createGuideDescriptor', () => {
  it('passes template through containerStyle via --bkgd-t CSS var', () => {
    const { containerStyle } = createGuideDescriptor(baseParams)
    expect(containerStyle['--bkgd-t']).toBe('repeat(48, 1px)')
    // The CSS module resolves grid-template-columns from the var, so no
    // inline gridTemplateColumns is emitted.
    expect(containerStyle.gridTemplateColumns).toBeUndefined()
  })

  it('emits calculated gap in px', () => {
    const { containerStyle } = createGuideDescriptor(baseParams)
    expect(containerStyle['--bkgd-g']).toBe('7px')
  })

  it('flags isLineVariant for line variant', () => {
    expect(createGuideDescriptor(baseParams).isLineVariant).toBe(true)
    expect(
      createGuideDescriptor({ ...baseParams, variant: 'pattern' }).isLineVariant
    ).toBe(false)
  })

  it('picks columnColor from colors[variant], falls back to line', () => {
    expect(createGuideDescriptor(baseParams).columnColor).toBe('red')
    expect(
      createGuideDescriptor({ ...baseParams, variant: 'fixed' }).columnColor
    ).toBe('blue')
    expect(
      createGuideDescriptor({ ...baseParams, variant: 'pattern' }).columnColor
    ).toBe('green')
  })

  it('classTokens includes line for line variant and visibility marker', () => {
    expect(createGuideDescriptor(baseParams).classTokens).toEqual([
      'gde',
      'v',
      'line',
    ])
    expect(
      createGuideDescriptor({ ...baseParams, variant: 'fixed' }).classTokens
    ).toEqual(['gde', 'v'])
    expect(
      createGuideDescriptor({ ...baseParams, isVisible: false }).classTokens
    ).toEqual(['gde', 'h', 'line'])
  })

  it('skips template CSS var when template is empty or "none"', () => {
    const noneTemplate = createGuideDescriptor({ ...baseParams, template: 'none' })
    expect(noneTemplate.containerStyle['--bkgd-t']).toBeUndefined()
  })
})
