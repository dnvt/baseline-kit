import { renderHook } from '@testing-library/react'
import * as measurementModule from '@/hooks/useMeasure'
import { useBaseline } from '@hooks'

describe('useBaseline', () => {
  let useMeasureSpy: any
  beforeEach(() => {
    // Fix: spy on 'useMeasure' (not 'useMeasurement')
    useMeasureSpy = vi.spyOn(measurementModule, 'useMeasure')
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the original spacing if snapping="none"', () => {
    useMeasureSpy.mockReturnValue({ width: 100, height: 42 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useBaseline(ref, {
        base: 8,
        snapping: 'none',
        spacing: { top: 10, bottom: 10, left: 5, right: 5 },
      }),
    )
    expect(result.current.padding).toEqual({
      top: 10,
      bottom: 10,
      left: 5,
      right: 5,
    })
    expect(result.current.isAligned).toBe(false) // 42 % 8 = 2, not aligned
  })

  it('adjusts bottom padding for "height" mode', () => {
    // measured height = 46 => remainder = 6, diff = 2, so bottom: 10 + 2 = 12
    useMeasureSpy.mockReturnValue({ width: 100, height: 46 })

    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useBaseline(ref, {
        base: 8,
        snapping: 'height',
        spacing: { top: 10, bottom: 10, left: 0, right: 0 },
      }),
    )

    expect(result.current.padding.bottom).toBe(12)
    expect(result.current.isAligned).toBe(false)
  })

  it('clamps top & bottom in "clamp" mode', () => {
    // measured height = 45 => remainder = 5, diff = 3
    // top => 10 % 8 = 2, bottom => (6 + 3) % 8 = 9 % 8 = 1
    useMeasureSpy.mockReturnValue({ width: 100, height: 45 })

    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useBaseline(ref, {
        base: 8,
        snapping: 'clamp',
        spacing: { top: 10, bottom: 6, left: 0, right: 0 },
      }),
    )

    expect(result.current.padding).toEqual({
      top: 2,
      bottom: 1,
      left: 0,
      right: 0,
    })
  })

  it('isAligned=true if measured height is exactly multiple of base', () => {
    useMeasureSpy.mockReturnValue({ width: 100, height: 48 })

    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useBaseline(ref, { base: 8, snapping: 'height', spacing: {} }),
    )
    expect(result.current.isAligned).toBe(true)
    expect(result.current.height).toBe(48)
  })

  it('throws if base<1', () => {
    useMeasureSpy.mockReturnValue({ width: 100, height: 50 })
    const ref = { current: document.createElement('div') }

    expect(() =>
      renderHook(() =>
        useBaseline(ref, {
          base: 0,
          snapping: 'height',
        }),
      ),
    ).toThrow()
  })
})