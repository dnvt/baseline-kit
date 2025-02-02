import { renderHook } from '@testing-library/react'
import { useDebug } from '@hooks'

describe('useVisibility', () => {
  it('returns isShown=true if prop=visible', () => {
    const { result } = renderHook(() =>
      useDebug('visible', 'none'),
    )
    expect(result.current).toEqual({
      isShown: true,
      isHidden: false,
      isNone: false,
    })
  })

  it('returns isHidden=true if prop=hidden', () => {
    const { result } = renderHook(() =>
      useDebug('hidden', 'visible'),
    )
    expect(result.current).toEqual({
      isShown: false,
      isHidden: true,
      isNone: false,
    })
  })

  it('returns isNone=true if prop=none', () => {
    const { result } = renderHook(() =>
      useDebug('none', 'visible'),
    )
    expect(result.current).toEqual({
      isShown: false,
      isHidden: false,
      isNone: true,
    })
  })

  it('falls back to configVisibility if prop is undefined', () => {
    const { result } = renderHook(() =>
      useDebug(undefined, 'visible'),
    )
    expect(result.current).toEqual({
      isShown: true,
      isHidden: false,
      isNone: false,
    })
  })

  it('falls back to configVisibility if prop is undefined, config=hidden', () => {
    const { result } = renderHook(() =>
      useDebug(undefined, 'hidden'),
    )
    expect(result.current).toEqual({
      isShown: false,
      isHidden: true,
      isNone: false,
    })
  })

  it('if both are undefined, everything is false', () => {
    const { result } = renderHook(() =>
      useDebug(undefined, undefined),
    )
    expect(result.current).toEqual({
      isShown: false,
      isHidden: false,
      isNone: false,
    })
  })

  it('if prop is set, config is ignored', () => {
    const { result } = renderHook(() =>
      useDebug('visible', 'hidden'),
    )
    // The prop 'visible' wins
    expect(result.current).toEqual({
      isShown: true,
      isHidden: false,
      isNone: false,
    })
  })
})