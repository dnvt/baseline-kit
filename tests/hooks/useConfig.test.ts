import { renderHook } from '@testing-library/react'
import { useConfig } from '@hooks'
import type { Config } from '@components'
import * as ComponentsModule from '@components'

describe('useConfig', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('merges base and the requested component config (e.g. "guide")', () => {
    // 1) Create a mock default config
    const mockDefaultConfig: Config = {
      base: 10,
      guide: {
        variant: 'line',
        visibility: 'hidden',
        colors: { line: 'red', pattern: 'blue', auto: 'green', fixed: 'orange' },
      },
      spacer: {
        variant: 'flat',
        visibility: 'visible',
        colors: { line: 'pink', flat: 'yellow', indice: 'cyan' },
      },
      box: {
        visibility: 'none',
        colors: { line: 'black', flat: 'gray', indice: 'white' },
      },
      padder: {
        visibility: 'hidden',
        color: 'purple',
      },
    }

    // 2) Spy on useDefaultConfig so it returns our mock
    vi.spyOn(ComponentsModule, 'useDefaultConfig').mockReturnValue(mockDefaultConfig)

    // 3) Render the hook with a chosen component key ("guide")
    const { result } = renderHook(() => useConfig('guide'))

    // 4) The returned object should merge { base: defaultConfig.base } + defaultConfig.guide
    expect(result.current.base).toBe(10) // from mockDefaultConfig.base
    // from the guide field
    expect(result.current.variant).toBe('line')
    expect(result.current.visibility).toBe('hidden')
    expect(result.current.colors).toEqual({
      line: 'red',
      pattern: 'blue',
      auto: 'green',
      fixed: 'orange',
    })
  })

  it('merges base and another component config (e.g. "box")', () => {
    const mockDefaultConfig: Config = {
      base: 8,
      guide: { /* ...omitted... */ } as never,
      spacer: { /* ...omitted... */ } as never,
      box: {
        visibility: 'visible',
        colors: { line: 'red', flat: 'blue', indice: 'green' },
      },
      padder: { visibility: 'none', color: 'purple' },
    }

    vi.spyOn(ComponentsModule, 'useDefaultConfig').mockReturnValue(mockDefaultConfig)

    const { result } = renderHook(() => useConfig('box'))

    expect(result.current.base).toBe(8)
    expect(result.current.visibility).toBe('visible')
    expect(result.current.colors).toEqual({
      line: 'red',
      flat: 'blue',
      indice: 'green',
    })
  })

  it('handles any changes if base changes', () => {
    vi.spyOn(ComponentsModule, 'useDefaultConfig').mockReturnValue({
      base: 20,
      guide: { /* ... */ } as never,
      spacer: { /* ... */ } as never,
      box: { /* ... */ } as never,
      padder: { /* ... */ } as never,
    })

    // e.g. "padder"
    const { result } = renderHook(() => useConfig('padder'))
    expect(result.current.base).toBe(20)
  })
})