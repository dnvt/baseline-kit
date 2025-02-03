import { renderHook } from '@testing-library/react'
import { useConfig } from '@hooks'
import type { Config } from '@components'
import * as ComponentsModule from '@components'

const minimalGuideStub: Config['guide'] = {
  variant: 'line',
  debugging: 'none',
  colors: {
    line: 'red',
    pattern: 'blue',
    auto: 'green',
    fixed: 'orange',
  },
}

const minimalSpacerStub: Config['spacer'] = {
  variant: 'flat',
  debugging: 'none',
  colors: {
    line: 'red',
    flat: 'blue',
    indice: 'green',
  },
}

const minimalBoxStub: Config['box'] = {
  debugging: 'none',
  colors: {
    line: 'red',
    flat: 'blue',
    indice: 'green',
  },
}

const minimalPadderStub: Config['padder'] = {
  debugging: 'none',
  color: 'purple',
}

const minimalBaselineStub: Config['baseline'] = {
  variant: 'line',
  debugging: 'none',
  colors: {
    line: 'pink',
    flat: 'yellow',
  },
}

describe('useConfig', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('merges base and the requested component config (e.g. "guide")', () => {
    const mockDefaultConfig: Config = {
      base: 10,
      baseline: {
        variant: 'line',
        debugging: 'hidden',
        colors: {
          line: 'pink',
          flat: 'yellow',
        },
      },
      guide: {
        variant: 'line',
        debugging: 'hidden',
        colors: {
          line: 'red',
          pattern: 'blue',
          auto: 'green',
          fixed: 'orange',
        },
      },
      spacer: {
        variant: 'flat',
        debugging: 'visible',
        colors: {
          line: 'pink',
          flat: 'yellow',
          indice: 'cyan',
        },
      },
      box: {
        debugging: 'hidden',
        colors: {
          line: 'black',
          flat: 'gray',
          indice: 'white',
        },
      },
      padder: {
        debugging: 'hidden',
        color: 'purple',
      },
    }

    vi.spyOn(ComponentsModule, 'useDefaultConfig').mockReturnValue(mockDefaultConfig)

    const { result } = renderHook(() => useConfig('guide'))

    expect(result.current.base).toBe(10) // from mockDefaultConfig.base
    // from the guide field:
    expect(result.current.variant).toBe('line')
    expect(result.current.debugging).toBe('hidden')
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
      guide: minimalGuideStub,
      spacer: minimalSpacerStub,
      box: {
        debugging: 'visible',
        colors: { line: 'red', flat: 'blue', indice: 'green' },
      },
      padder: minimalPadderStub,
      baseline: minimalBaselineStub,
    }

    vi.spyOn(ComponentsModule, 'useDefaultConfig').mockReturnValue(mockDefaultConfig)
    const { result } = renderHook(() => useConfig('box'))

    expect(result.current.base).toBe(8)
    expect(result.current.debugging).toBe('visible')
    expect(result.current.colors).toEqual({
      line: 'red',
      flat: 'blue',
      indice: 'green',
    })
  })

  it('updates when the default configuration changes', () => {
    let currentConfig: Config = {
      base: 20,
      guide: minimalGuideStub,
      spacer: minimalSpacerStub,
      box: minimalBoxStub,
      padder: minimalPadderStub,
      baseline: minimalBaselineStub,
    }
    const defaultConfigSpy = vi
      .spyOn(ComponentsModule, 'useDefaultConfig')
      .mockImplementation(() => currentConfig)

    const { result, rerender } = renderHook(() => useConfig('padder'))
    expect(result.current.base).toBe(20)

    // Update the default config and re-render.
    currentConfig = { ...currentConfig, base: 30 }
    rerender()

    expect(result.current.base).toBe(30)
    defaultConfigSpy.mockRestore()
  })

  it('returns the same reference if the default config does not change', () => {
    const mockDefaultConfig: Config = {
      base: 15,
      guide: minimalGuideStub,
      spacer: minimalSpacerStub,
      box: minimalBoxStub,
      padder: minimalPadderStub,
      baseline: minimalBaselineStub,
    }
    vi.spyOn(ComponentsModule, 'useDefaultConfig').mockReturnValue(mockDefaultConfig)
    const { result, rerender } = renderHook(() => useConfig('padder'))
    const firstResult = result.current

    rerender()
    expect(result.current).toBe(firstResult)
  })
})