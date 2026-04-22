import { calculateGuideTemplate } from '@utils'

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
