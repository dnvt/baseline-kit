import { renderHook } from '@testing-library/react'
import { useDebug } from '@hooks'

describe('useDebug', () => {
  it('returns isShown=true if prop is "visible"', () => {
    const { result } = renderHook(() => useDebug('visible', 'none'))
    expect(result.current).toEqual({
      isShown: true,
      isHidden: false,
      isNone: false,
    })
  })

  it('returns isHidden=true if prop is "hidden"', () => {
    const { result } = renderHook(() => useDebug('hidden', 'visible'))
    expect(result.current).toEqual({
      isShown: false,
      isHidden: true,
      isNone: false,
    })
  })

  it('returns isNone=true if prop is "none"', () => {
    const { result } = renderHook(() => useDebug('none', 'visible'))
    expect(result.current).toEqual({
      isShown: false,
      isHidden: false,
      isNone: true,
    })
  })

  it('falls back to configVisibility if prop is undefined (visible)', () => {
    const { result } = renderHook(() => useDebug(undefined, 'visible'))
    expect(result.current).toEqual({
      isShown: true,
      isHidden: false,
      isNone: false,
    })
  })

  it('falls back to configVisibility if prop is undefined (hidden)', () => {
    const { result } = renderHook(() => useDebug(undefined, 'hidden'))
    expect(result.current).toEqual({
      isShown: false,
      isHidden: true,
      isNone: false,
    })
  })

  it('returns all false if both prop and config are undefined', () => {
    const { result } = renderHook(() => useDebug(undefined, undefined))
    expect(result.current).toEqual({
      isShown: false,
      isHidden: false,
      isNone: false,
    })
  })

  it('prefers the prop value over the config value', () => {
    const { result } = renderHook(() => useDebug('visible', 'hidden'))
    expect(result.current).toEqual({
      isShown: true,
      isHidden: false,
      isNone: false,
    })
  })

  it('returns the same object reference when inputs do not change (memoization)', () => {
    const { result, rerender } = renderHook(() => useDebug('visible', 'hidden'))
    const firstResult = result.current
    rerender()
    expect(result.current).toBe(firstResult)
  })
})