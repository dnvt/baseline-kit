import { calculateGuideTemplate } from '@baseline-kit/core'

describe('calculateGuideTemplate viewport context', () => {
  it('forwards context to vw-based gap conversion', () => {
    // 10vw with viewportWidth=1000 => 100px; default 1920 would give 192.
    const resultSmall = calculateGuideTemplate(
      1000,
      { variant: 'line', gap: '10vw', base: 1 },
      { viewportWidth: 1000 }
    )
    const resultLarge = calculateGuideTemplate(
      1000,
      { variant: 'line', gap: '10vw', base: 1 },
      { viewportWidth: 1920 }
    )
    expect(resultSmall.calculatedGap).toBe(100 - 1)
    expect(resultLarge.calculatedGap).toBe(192 - 1)
  })
})

describe('calculateGuideTemplate string gaps', () => {
  it('resolves a rem gap against the root font size and rounds it to the base', () => {
    const at = (rootFontSize: number) =>
      calculateGuideTemplate(
        300,
        { variant: 'fixed', columns: 4, gap: '1rem', base: 8 },
        { rootFontSize }
      ).calculatedGap
    expect(at(16)).toBe(16)
    expect(at(20)).toBe(24)
    expect(at(32)).toBe(32)
  })

  it('counts auto columns with the same gap the CSS uses', () => {
    const columns = (rootFontSize: number) =>
      calculateGuideTemplate(
        300,
        { variant: 'auto', columnWidth: 40, gap: '1rem', base: 8 },
        { rootFontSize }
      ).columnsCount
    // floor((300 + gap) / (40 + gap))
    expect(columns(16)).toBe(5)
    expect(columns(32)).toBe(4)
  })

  it("resolves percentages against the Guide's own width", () => {
    const result = calculateGuideTemplate(400, {
      variant: 'auto',
      columnWidth: '25%',
      gap: '2%',
      base: 1,
    })
    expect(result.calculatedGap).toBe(8)
    // floor((400 + 8) / (100 + 8)); 7.0 resolved % against 0px: 1 column.
    expect(result.columnsCount).toBe(3)
  })
})
