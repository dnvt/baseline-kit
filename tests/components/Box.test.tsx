import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import type { CSSProperties, PropsWithChildren } from 'react'
import { Box, ComponentsProps, DebuggingMode, Padding, SnappingMode } from '@components'

// Mock CSS modules
vi.mock('./styles.module.css', () => ({
  default: {
    box: 'box',
    visible: 'visible',
    hidden: 'hidden',
  },
}))

// Mock the Padder component so that it simply renders its children and adds a test id.
vi.mock('@components/Padder', () => ({
  Padder: ({ children, block, inline }: PropsWithChildren<ComponentsProps>) => (
    <div data-testid="padder">
      {/* Vertical spacers */}
      {(block && Array.isArray(block) && block.map((height, i) => (
        <div
          key={`v-${i}`}
          data-testid="spacer"
          style={{ '--pdd-spacer-height': height, '--pdd-spacer-width': '100%' } as CSSProperties}
        />
      )))}
      {children}
      {/* Horizontal spacers */}
      {(inline && Array.isArray(inline) && inline.map((width, i) => (
        <div
          key={`h-${i}`}
          data-testid="spacer"
          style={{ '--pdd-spacer-width': width, '--pdd-spacer-height': '100%' } as CSSProperties}
        />
      )))}
    </div>
  ),
}))

// Mock hooks used in Box.
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
  useDebug: vi.fn().mockImplementation((debug: DebuggingMode, configDebug: never) => ({
    isShown: (debug ?? configDebug) === 'visible',
    isHidden: (debug ?? configDebug) === 'hidden',
    isNone: (debug ?? configDebug) === 'none',
  })),
  useBaseline: vi.fn().mockImplementation((_ref: never, { snapping, spacing }: {
    snapping: SnappingMode,
    spacing: Padding
  }) => {
    const { top = 0, bottom = 0, left = 0, right = 0 } = spacing || {}
    let finalTop = top, finalBottom = bottom, finalLeft = left, finalRight = right
    if (snapping === 'clamp') {
      finalTop = 6
      finalBottom = 6
      finalLeft = 10
      finalRight = 10
    } else if (snapping === 'none') {
      finalTop = 16
      finalBottom = 24
      finalLeft = 8
      finalRight = 8
    } else if (snapping === 'height') {
      if (top === 6) finalTop = 8
      if (bottom === 10) finalBottom = 16
    }
    return {
      padding: { top: finalTop, bottom: finalBottom, left: finalLeft, right: finalRight },
      isAligned: true,
      height: 100,
    }
  }),
  useVirtual: vi.fn().mockReturnValue({ start: 0, end: 0 }),
  useMeasure: vi.fn().mockReturnValue({ width: 1024, height: 768 }),
}))

describe('<Box /> component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default props and displays children', () => {
    render(<Box>Box content</Box>)
    const boxEl = screen.getByTestId('box')
    expect(boxEl).toBeInTheDocument()
    // Default debugging from our mock config for "box" is "visible".
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

    // Query for elements that represent spacers.
    const spacers = screen.getAllByTestId('spacer')

    // Filter based on style attribute values (as strings).
    const verticalSpacers = spacers.filter(s =>
      s.getAttribute('style')?.includes('--pdd-spacer-width: 100%'),
    )
    const horizontalSpacers = spacers.filter(s =>
      s.getAttribute('style')?.includes('--pdd-spacer-height: 100%'),
    )

    // For our mock, in clamp mode, vertical spacers should be set to 6.
    expect(verticalSpacers[0]).toHaveAttribute(
      'style',
      expect.stringContaining('--pdd-spacer-height: 6'),
    )
    expect(verticalSpacers[1]).toHaveAttribute(
      'style',
      expect.stringContaining('--pdd-spacer-height: 6'),
    )

    // For horizontal spacers, if inline=10, the mock returns 10 (or a desired value).
    horizontalSpacers.forEach(spacer => {
      expect(spacer).toHaveAttribute(
        'style',
        expect.stringContaining('--pdd-spacer-width: 10'),
      )
    })
  })

  it('uses raw spacing if snapping="none"', () => {
    render(
      <Box block={[14, 22]} inline={10} snapping="none">
        No modulo
      </Box>,
    )
    const spacers = screen.getAllByTestId('spacer')

    const verticalSpacers = spacers.filter(s =>
      s.getAttribute('style')?.includes('--pdd-spacer-width: 100%'),
    )
    const horizontalSpacers = spacers.filter(s =>
      s.getAttribute('style')?.includes('--pdd-spacer-height: 100%'),
    )

    // Based on our mock for "none" mode, we expect:
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
    const spacers = screen.getAllByTestId('spacer')
    const verticalSpacers = spacers.filter(s =>
      s.getAttribute('style')?.includes('--pdd-spacer-width: 100%'),
    )
    // For our "height" mode mock, we expect top to be 8 and bottom to be 16.
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
    // Instead of toHaveStyle, check the inline style attribute.
    const inlineStyle = boxEl.getAttribute('style') || ''
    expect(inlineStyle).toContain('background-color: red')
    expect(inlineStyle).toContain('--my-var: foo')
  })
})