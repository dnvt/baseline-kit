import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Box } from '@components'
import type { CSSProperties } from 'react'

vi.mock('@hooks', () => {
  const dimensionBaseMock = vi.fn()

  return {
    useConfig: (component: string) => {
      if (component === 'box') {
        return {
          base: 8,
          visibility: 'visible',
          colors: {
            line: '#FF00FF',
            flat: '#CCC',
            indice: '#0F0',
          },
        }
      }
      if (component === 'padder') {
        return {
          base: 8,
          visibility: 'visible',
          color: '#FF00FF',
        }
      }
      if (component === 'spacer') {
        return {
          base: 8,
          visibility: 'visible',
          variant: 'flat',
          colors: {
            line: '#FF00FF',
            flat: '#CCC',
            indice: '#0F0',
          },
        }
      }
      return {}
    },

    useVisibility: vi.fn().mockImplementation((visibility, configVisibility) => ({
      isShown: (visibility ?? configVisibility) === 'visible',
      isHidden: (visibility ?? configVisibility) === 'hidden',
      isNone: (visibility ?? configVisibility) === 'none',
    })),

    useDimensionBaseMultiple: dimensionBaseMock,

    useNormalizedDimensions: vi.fn().mockImplementation(({ width, height }) => ({
      width: width ?? 'fit-content',
      height: height ?? 'fit-content',
      normalizedWidth: 0,
      normalizedHeight: 0,
    })),
  }
})

describe('<Box /> component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default props => visible', () => {
    render(<Box>Box content</Box>)
    const boxEl = screen.getByTestId('box')
    expect(boxEl).toBeInTheDocument()
    expect(boxEl.className).toMatch(/visible/)
    screen.getByText('Box content')
  })

  it('renders hidden if visibility="hidden"', () => {
    render(<Box debugging="hidden">Hidden content</Box>)
    const boxEl = screen.getByTestId('box')
    expect(boxEl.className).not.toMatch(/visible/)
  })

  it('moduloizes spacing by default (isModuloize=true)', () => {
    render(
      <Box block={[14, 22]} inline={10}>
        Child
      </Box>,
    )
    const padderEl = screen.getByTestId('padder')
    const spacers = padderEl.querySelectorAll('[data-testid="spacer"]')

    // With visibility=visible, Padder uses Spacer components
    expect(spacers).toHaveLength(4) // One for each side

    // Check spacer dimensions
    spacers.forEach(spacer => {
      const style = spacer.getAttribute('style') || ''
      const height = style.match(/--pdd-spacer-height:\s*(\d+px)/)?.[1]
      const width = style.match(/--pdd-spacer-width:\s*(\d+px)/)?.[1]

      if (height && height !== '100%') {
        expect(['6px', '6px']).toContain(height) // 14%8=6, 22%8=6
      }
      if (width && width !== '100%') {
        expect(width).toBe('2px') // 10%8=2
      }
    })
  })

  it('skips modulo if isModuloize=false', () => {
    render(
      <Box block={[14, 22]} inline={10} snapping={false}>
        No modulo
      </Box>,
    )
    const padderEl = screen.getByTestId('padder')
    const spacers = padderEl.querySelectorAll('[data-testid="spacer"]')

    spacers.forEach(spacer => {
      const style = spacer.getAttribute('style') || ''
      const height = style.match(/--pdd-spacer-height:\s*(\d+px)/)?.[1]
      const width = style.match(/--pdd-spacer-width:\s*(\d+px)/)?.[1]

      if (height && height !== '100%') {
        expect(['14px', '22px']).toContain(height)
      }
      if (width && width !== '100%') {
        expect(width).toBe('10px')
      }
    })
  })

  it('calls useDimensionBaseMultiple once by default', async () => {
    const { useDimensionBaseMultiple } = vi.mocked(await import('@hooks'))
    render(<Box>Dimension check</Box>)
    expect(useDimensionBaseMultiple).toHaveBeenCalledTimes(1)
    expect(useDimensionBaseMultiple).toHaveBeenCalledWith(
      expect.any(Object),
      8,
      true,
    )
  })

  it('warns if the rendered height is not multiple of base', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
    })
    const { useDimensionBaseMultiple } = vi.mocked(await import('@hooks'))

    useDimensionBaseMultiple.mockImplementation((ref, base) => {
      console.warn(
        `The element's height (13px) is not a multiple of the base unit (${base}px).`,
        { height: 13, base },
      )
    })

    render(<Box>Check base multiple</Box>)

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('is not a multiple of the base unit (8px)'),
      expect.any(Object),
    )
  })

  it('applies custom className and style props', () => {
    render(
      <Box
        className="my-custom-box"
        style={{ backgroundColor: 'red', '--my-var': 'foo' } as CSSProperties}
      >
        Something
      </Box>,
    )
    const boxEl = screen.getByTestId('box')
    expect(boxEl.className).toMatch(/my-custom-box/)

    const style = boxEl.getAttribute('style') || ''
    expect(style).toContain('background-color: red')
    expect(style).toContain('--my-var: foo')
  })
})
