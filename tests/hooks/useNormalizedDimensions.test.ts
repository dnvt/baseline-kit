import { renderHook } from '@testing-library/react'
import { useNormalizedDimensions } from '../../src/lib'

describe('useNormalizedDimensions', () => {
  it('returns 100% dimensions + fallback numeric when width/height are undefined', () => {
    const { result } = renderHook(() =>
      useNormalizedDimensions({
        base: 8,
        defaultWidth: 200,
        defaultHeight: 100,
      }),
    )

    // Because width/height are undefined -> '100%'
    // numeric => 200, 100
    expect(result.current.width).toBe('100%')
    expect(result.current.height).toBe('100%')
    expect(result.current.normalizedWidth).toBe(200)
    expect(result.current.normalizedHeight).toBe(100)

    // cssProps and dimensions should match
    expect(result.current.cssProps['--dimension-width']).toBe('100%')
    expect(result.current.cssProps['--dimension-height']).toBe('100%')
    expect(result.current.dimensions.width).toBe('100%')
    expect(result.current.dimensions.height).toBe('100%')
  })

  it('handles "auto" or "100%" by preserving string + numeric=base', () => {
    const { result: rAuto } = renderHook(() =>
      useNormalizedDimensions({
        width: 'auto',
        height: '100%',
        base: 8,
      }),
    )
    // 'auto' -> numeric=8
    expect(rAuto.current.width).toBe('auto')
    expect(rAuto.current.normalizedWidth).toBe(8)
    // '100%' -> numeric=8
    expect(rAuto.current.height).toBe('100%')
    expect(rAuto.current.normalizedHeight).toBe(8)

    const { result: rFull } = renderHook(() =>
      useNormalizedDimensions({
        width: '100%',
        height: 'auto',
        base: 10,
      }),
    )
    // '100%' -> numeric=10
    expect(rFull.current.width).toBe('100%')
    expect(rFull.current.normalizedWidth).toBe(10)
    // 'auto' -> numeric=10
    expect(rFull.current.height).toBe('auto')
    expect(rFull.current.normalizedHeight).toBe(10)
  })

  it('normalizes numeric width/height to px string + numeric', () => {
    const { result } = renderHook(() =>
      useNormalizedDimensions({
        width: 50,
        height: 42,
        base: 8,
      }),
    )
    // Suppose your MeasurementSystem rounds 50 => 48 or 16 => 16
    // By default: 50/8=6.25 => round=6 => 6*8=48
    // 42/8=5.25 => round=5 => 5*8=40

    expect(result.current.width).toBe('48px')
    expect(result.current.normalizedWidth).toBe(48)
    expect(result.current.height).toBe('40px')
    expect(result.current.normalizedHeight).toBe(40)
  })

  it('keeps string units for CSS but normalizes numeric dimension behind the scenes', () => {
    const { result } = renderHook(() =>
      useNormalizedDimensions({
        width: '24px',   // string with units
        height: '2rem',  // e.g. 2rem => 32 => round multiple=32 if base=8
        base: 8,
      }),
    )

    // The hook will parse & normalize, but keep the original string in `.width/.height`
    // e.g. '24px' => numeric=24 => round(24/8=3)=>3*8=24
    // '2rem' => typically 32 => 32 => round(32/8=4)=>4*8=32
    expect(result.current.width).toBe('24px')
    expect(result.current.normalizedWidth).toBe(24)
    expect(result.current.height).toBe('2rem')
    expect(result.current.normalizedHeight).toBe(32)

    // Also check cssProps
    expect(result.current.cssProps['--dimension-width']).toBe('24px')
    expect(result.current.cssProps['--dimension-height']).toBe('2rem')
  })

  it('supports fallback default if the user passes undefined for width or height', () => {
    // width is undefined => "100%", numeric => defaultWidth(10)
    // height is 40 => normalizes => e.g. 40 => 40
    const { result } = renderHook(() =>
      useNormalizedDimensions({
        defaultWidth: 10,
        defaultHeight: 20,
        height: 40,
        base: 8,
      }),
    )
    expect(result.current.width).toBe('100%')
    expect(result.current.normalizedWidth).toBe(10)
    expect(result.current.height).toBe('40px')
    expect(result.current.normalizedHeight).toBe(40)
  })
})