import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import type { CSSProperties } from 'react'
import { Box } from '@components'

// Mock CSS modules
vi.mock('./styles.module.css', () => ({
  default: {
    box: 'box',
    visible: 'visible',
    hidden: 'hidden',
  },
}))

// Mock hooks
vi.mock('@hooks', () => ({
  useConfig: vi.fn((component: string) => {
    if (component === 'box') {
      return {
        base: 8,
        debugging: 'visible',
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
        debugging: 'visible',
        color: '#FF00FF',
      }
    }
    if (component === 'spacer') {
      return {
        base: 8,
        debugging: 'visible',
        variant: 'flat',
        colors: {
          line: '#FF00FF',
          flat: '#CCC',
          indice: '#0F0',
        },
      }
    }
    return {}
  }),

  useDebugging: vi.fn().mockImplementation((visibility, configVisibility) => ({
    isShown: (visibility ?? configVisibility) === 'visible',
    isHidden: (visibility ?? configVisibility) === 'hidden',
    isNone: (visibility ?? configVisibility) === 'none',
  })),

  usePaddingSnap: vi.fn().mockImplementation((padding, snapping, base) => {
    if (snapping === 'none') return padding
    if (snapping === 'height') {
      return padding === 10 ? 15 : padding
    }
    return padding % base || base
  }),

  useNormalizedDimensions: vi.fn().mockImplementation(({ width, height }) => ({
    width: width ?? 'fit-content',
    height: height ?? 'fit-content',
    normalizedWidth: 0,
    normalizedHeight: 0,
    cssProps: {
      '--dimension-width': width ?? 'fit-content',
      '--dimension-height': height ?? 'fit-content',
    },
    dimensions: {
      width: width ?? 'fit-content',
      height: height ?? 'fit-content',
    },
  })),
}))

describe('<Box /> component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default props => debugging is "visible" by default', () => {
    render(<Box>Box content</Box>)
    const boxEl = screen.getByTestId('box')
    expect(boxEl).toBeInTheDocument()
    expect(boxEl.className).toContain('visible')
    expect(screen.getByText('Box content')).toBeInTheDocument()
  })

  it('renders hidden if debugging="hidden"', () => {
    render(<Box debugging="hidden">Hidden content</Box>)
    const boxEl = screen.getByTestId('box')
    expect(boxEl.className).not.toContain('visible')
  })

  it('snapping defaults to "clamp", so it moduloizes block or inline spacing', () => {
    render(
      <Box block={[14, 22]} inline={10}>
        Child
      </Box>,
    )

    const padderEl = screen.getByTestId('padder')
    const spacers = Array.from(padderEl.querySelectorAll('[data-testid="spacer"]'))

    const verticalSpacers = spacers.filter(s =>
      s.getAttribute('style')?.includes('--pdd-spacer-width: 100%'),
    )

    const horizontalSpacers = spacers.filter(s =>
      s.getAttribute('style')?.includes('--pdd-spacer-height: 100%'),
    )

    // Check vertical spacers (block spacing)
    expect(verticalSpacers[0]).toHaveAttribute(
      'style',
      expect.stringContaining('--pdd-spacer-height: 8'),
    )
    expect(verticalSpacers[1]).toHaveAttribute(
      'style',
      expect.stringContaining('--pdd-spacer-height: 8'),
    )

    // Check horizontal spacers (inline spacing)
    // 10 gets normalized to 8 (nearest base multiple)
    horizontalSpacers.forEach(spacer => {
      expect(spacer).toHaveAttribute(
        'style',
        expect.stringContaining('--pdd-spacer-width: 8'),
      )
    })
  })

  it('uses raw spacing if snapping="none"', () => {
    render(
      <Box block={[14, 22]} inline={10} snapping="none">
        No modulo
      </Box>,
    )

    const padderEl = screen.getByTestId('padder')
    const spacers = Array.from(padderEl.querySelectorAll('[data-testid="spacer"]'))

    const verticalSpacers = spacers.filter(s =>
      s.getAttribute('style')?.includes('--pdd-spacer-width: 100%'),
    )

    const horizontalSpacers = spacers.filter(s =>
      s.getAttribute('style')?.includes('--pdd-spacer-height: 100%'),
    )

    expect(verticalSpacers[0]).toHaveAttribute(
      'style',
      expect.stringContaining('--pdd-spacer-height: 16'),
    )
    expect(verticalSpacers[1]).toHaveAttribute(
      'style',
      expect.stringContaining('--pdd-spacer-height: 24'),
    )

    horizontalSpacers.forEach(spacer => {
      expect(spacer).toHaveAttribute(
        'style',
        expect.stringContaining('--pdd-spacer-width: 8'),
      )
    })
  })

  it('snaps the final box height if snapping="height"', () => {
    render(
      <Box block={[6, 10]} snapping="height">
        Some content
      </Box>,
    )

    const padderEl = screen.getByTestId('padder')
    const spacers = Array.from(padderEl.querySelectorAll('[data-testid="spacer"]'))

    const verticalSpacers = spacers.filter(s =>
      s.getAttribute('style')?.includes('--pdd-spacer-width: 100%'),
    )

    expect(verticalSpacers[0]).toHaveAttribute(
      'style',
      expect.stringContaining('--pdd-spacer-height: 8'),
    )
    expect(verticalSpacers[1]).toHaveAttribute(
      'style',
      expect.stringContaining('--pdd-spacer-height: 16'),
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
    expect(boxEl).toHaveClass('my-custom-box')

    const style = boxEl.getAttribute('style') || ''
    expect(style).toContain('background-color: red')
    expect(style).toContain('--my-var: foo')
  })
})