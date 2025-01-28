import { renderHook } from '@testing-library/react'
import * as measurementModule from '@/hooks/core/useMeasurement'
import { useBaseline } from '@hooks'

describe('useBaseline', () => {
  let useMeasurementSpy: any
  beforeEach(() => {
    useMeasurementSpy = vi.spyOn(measurementModule, 'useMeasurement')
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the original spacing if snapping="none"', () => {
    useMeasurementSpy.mockReturnValue({ width: 100, height: 42 })
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
    expect(result.current.isAligned).toBe(false) // 42%8=2 => not aligned
  })

  it('adjusts bottom padding for "height" mode', () => {
    // measured height=46 => remainder=6 => needs +2 => final=48
    useMeasurementSpy.mockReturnValue({ width: 100, height: 46 })

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
    // The "isAligned" might remain false until a re-measure sees total=48
  })

  it('clamps top & bottom in "clamp" mode', () => {
    // Suppose measured height=45 => remainder=5 => needs +3 => final=48
    // top => top%base => bottom => (bottom + 3) % base => ...
    useMeasurementSpy.mockReturnValue({ width: 100, height: 45 })

    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useBaseline(ref, {
        base: 8,
        snapping: 'clamp',
        spacing: { top: 10, bottom: 6, left: 0, right: 0 },
      }),
    )

    // top => 10%8=2
    // bottom => 6 +3=9 => 9%8=1
    expect(result.current.padding).toEqual({
      top: 2,
      bottom: 1,
      left: 0,
      right: 0,
    })
  })

  it('isAligned=true if measured height is exactly multiple of base', () => {
    useMeasurementSpy.mockReturnValue({ width: 100, height: 48 })

    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useBaseline(ref, { base: 8, snapping: 'height', spacing: {} }),
    )
    expect(result.current.isAligned).toBe(true)
    expect(result.current.height).toBe(48)
  })

  it('throws if base<1', () => {
    useMeasurementSpy.mockReturnValue({ width: 100, height: 50 })
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