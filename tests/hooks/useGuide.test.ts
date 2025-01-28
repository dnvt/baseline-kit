import { renderHook } from '@testing-library/react'
import * as measurementModule from '@/hooks/core/useMeasurement'
import { useGuide } from '@hooks'

describe('useGuide', () => {
  let useMeasurementSpy: any

  beforeEach(() => {
    useMeasurementSpy = vi.spyOn(measurementModule, 'useMeasurement')
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('handles line variant with known width', () => {
    useMeasurementSpy.mockReturnValue({ width: 100, height: 50 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() => useGuide(ref, {
      variant: 'line',
      gap: 8,
      base: 8,
    }))
    // E.g. "repeat(12, 1px)", isValid=true, ...
    expect(result.current.template).toMatch(/repeat/)
    expect(result.current.isValid).toBe(true)
  })

  it('pattern variant success', () => {
    useMeasurementSpy.mockReturnValue({ width: 400, height: 200 })
    const ref = { current: document.createElement('div') }

    const { result } = renderHook(() => useGuide(ref, {
      variant: 'pattern',
      columns: ['10px', '2fr', 'auto'],
      gap: 4,
    }))

    expect(result.current.template).toBe('10px 2fr auto')
    expect(result.current.isValid).toBe(true)
  })

  it('auto variant calculates columns count', () => {
    useMeasurementSpy.mockReturnValue({ width: 400, height: 200 })
    const ref = { current: document.createElement('div') }

    const { result } = renderHook(() => useGuide(ref, {
      variant: 'auto',
      columnWidth: 100,
      gap: 8,
    }))
    // => 'repeat(auto-fit, minmax(100px,1fr))'
    // columnsCount => 3 if your logic floors (400+8)/(108)=3.7 => 3
    expect(result.current.isValid).toBe(true)
    expect(result.current.template).toContain('auto-fit')
  })

  it('returns isValid=false if container width=0', () => {
    useMeasurementSpy.mockReturnValue({ width: 0, height: 50 })
    const ref = { current: document.createElement('div') }

    const { result } = renderHook(() => useGuide(ref, { variant: 'line' }))
    expect(result.current.isValid).toBe(false)
    expect(result.current.template).toBe('none')
  })

  it('handles invalid pattern => isValid=false', () => {
    useMeasurementSpy.mockReturnValue({ width: 300, height: 100 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() => useGuide(ref, {
      variant: 'pattern',
      columns: ['0px', 'auto'],
      gap: 4,
    }))
    expect(result.current.isValid).toBe(false)
    expect(result.current.template).toBe('none')
  })

  it('falls back to line if variant is unknown', () => {
    useMeasurementSpy.mockReturnValue({ width: 100, height: 50 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() => useGuide(ref, {
      variant: 'other' as any,
    }))
    expect(result.current.isValid).toBe(true)
    expect(result.current.template).toMatch(/repeat/)
  })
})