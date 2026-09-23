import { fireEvent, screen } from '@testing-library/react'
import { render } from '../render'
import '@testing-library/jest-dom'
import type { CSSProperties } from 'react'
import { useState } from 'react'
import { Box, DebuggingMode, Padding, SnappingMode } from '@components'
import { useBaseline } from '@hooks'

function StatefulField() {
  const [value, setValue] = useState('before')
  return (
    <input
      aria-label="stateful Box child"
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
    />
  )
}

// Mock CSS modules
vi.mock('./styles.module.css', () => ({
  default: {
    box: 'box',
    visible: 'visible',
    hidden: 'hidden',
  },
}))

vi.mock('@components/Spacer', () => ({
  Spacer: ({
    width,
    height,
  }: {
    width?: number | string
    height?: number | string
  }) => (
    <div
      data-testid="spacer"
      style={
        {
          '--bk-spacer-height': height ?? '100%',
          '--bk-spacer-width': width ?? '100%',
        } as CSSProperties
      }
    />
  ),
}))

// Mock hooks used in Box.
vi.mock('@hooks', () => ({
  useConfig: vi.fn((component: string) => {
    if (component === 'box') {
      return {
        domDiagnostics: true,
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
        domDiagnostics: true,
        base: 8,
        debugging: 'visible',
        color: '#FF00FF',
      }
    }
    if (component === 'spacer') {
      return {
        domDiagnostics: true,
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
  useDebug: vi
    .fn()
    .mockImplementation((debug: DebuggingMode, configDebug: never) => ({
      debugging: debug ?? configDebug,
      isShown: (debug ?? configDebug) === 'visible',
      isHidden: (debug ?? configDebug) === 'hidden',
      isNone: (debug ?? configDebug) === 'none',
    })),
  useBaseline: vi.fn().mockImplementation(
    (
      _ref: never,
      {
        snapping,
        spacing,
      }: {
        snapping: SnappingMode
        spacing: Padding
      }
    ) => {
      const { top = 0, bottom = 0, left = 0, right = 0 } = spacing || {}
      let finalTop = top,
        finalBottom = bottom,
        finalLeft = left,
        finalRight = right
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
        padding: {
          top: finalTop,
          bottom: finalBottom,
          left: finalLeft,
          right: finalRight,
        },
        isAligned: true,
        height: 100,
      }
    }
  ),
  useVirtual: vi.fn().mockReturnValue({ start: 0, end: 0 }),
  useMeasure: vi.fn().mockReturnValue({ width: 1024, height: 768 }),
  useIsClient: vi.fn(() => true),
}))

describe('<Box /> component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default props and displays children', () => {
    const { container } = render(<Box>Box content</Box>)
    const boxEl = screen.getByTestId('box')
    expect(boxEl).toBeInTheDocument()
    // Visible diagnostics stay on the compact merged host by default.
    expect(boxEl.className).toContain('v')
    expect(container.querySelectorAll('*')).toHaveLength(2)
    expect(screen.queryByTestId('padder')).not.toBeInTheDocument()
    expect(screen.getByText('Box content')).toBeInTheDocument()
  })

  it('uses one Padder outline on the separate path', () => {
    render(
      <Box className="custom-layout" debugging="visible">
        Box content
      </Box>
    )
    const boxEl = screen.getByTestId('box')
    expect(screen.getByTestId('padder')).toBeInTheDocument()
    expect(boxEl.className).not.toMatch(/padderVisible/i)
  })

  it('keeps merged Box children mounted across debug-mode changes', () => {
    const { rerender } = render(
      <Box debugging="visible">
        <StatefulField />
      </Box>
    )
    const field = screen.getByRole('textbox', { name: 'stateful Box child' })
    fireEvent.change(field, { target: { value: 'edited' } })
    field.focus()

    rerender(
      <Box debugging="hidden">
        <StatefulField />
      </Box>
    )

    expect(screen.getByRole('textbox', { name: 'stateful Box child' })).toBe(
      field
    )
    expect(field).toHaveValue('edited')
    expect(document.activeElement).toBe(field)
  })

  it('keeps separate Padder children mounted when debugging becomes none', () => {
    const { rerender } = render(
      <Box className="custom-layout" debugging="visible">
        <StatefulField />
      </Box>
    )
    const field = screen.getByRole('textbox', { name: 'stateful Box child' })
    fireEvent.change(field, { target: { value: 'edited' } })
    field.focus()

    rerender(
      <Box className="custom-layout" debugging="none">
        <StatefulField />
      </Box>
    )

    expect(screen.getByRole('textbox', { name: 'stateful Box child' })).toBe(
      field
    )
    expect(field).toHaveValue('edited')
    expect(document.activeElement).toBe(field)
  })

  it('renders hidden if debugging="hidden"', () => {
    render(<Box debugging="hidden">Hidden content</Box>)
    const boxEl = screen.getByTestId('box')
    expect(boxEl.className).not.toContain('visible')
  })

  it('snapping defaults to "clamp", so it moduloizes block or inline spacing', () => {
    render(
      <Box className="layout" block={[14, 22]} inline={10}>
        Child
      </Box>
    )

    // Query for elements that represent spacers.
    const spacers = screen.getAllByTestId('spacer')

    // Filter based on style attribute values (as strings).
    const verticalSpacers = spacers.filter((s) =>
      s.getAttribute('style')?.includes('--bk-spacer-width: 100%')
    )
    const horizontalSpacers = spacers.filter((s) =>
      s.getAttribute('style')?.includes('--bk-spacer-height: 100%')
    )

    // For our mock, in clamp mode, vertical spacers should be set to 6.
    expect(verticalSpacers[0]).toHaveAttribute(
      'style',
      expect.stringContaining('--bk-spacer-height: 6')
    )
    expect(verticalSpacers[1]).toHaveAttribute(
      'style',
      expect.stringContaining('--bk-spacer-height: 6')
    )

    // For horizontal spacers, if inline=10, the mock returns 10 (or a desired value).
    horizontalSpacers.forEach((spacer) => {
      expect(spacer).toHaveAttribute(
        'style',
        expect.stringContaining('--bk-spacer-width: 10')
      )
    })
  })

  it('uses raw spacing if snapping="none"', () => {
    render(
      <Box className="layout" block={[14, 22]} inline={10} snapping="none">
        No modulo
      </Box>
    )
    const spacers = screen.getAllByTestId('spacer')

    const verticalSpacers = spacers.filter((s) =>
      s.getAttribute('style')?.includes('--bk-spacer-width: 100%')
    )
    const horizontalSpacers = spacers.filter((s) =>
      s.getAttribute('style')?.includes('--bk-spacer-height: 100%')
    )

    // Based on our mock for "none" mode, we expect:
    expect(verticalSpacers[0]).toHaveAttribute(
      'style',
      expect.stringContaining('--bk-spacer-height: 16')
    )
    expect(verticalSpacers[1]).toHaveAttribute(
      'style',
      expect.stringContaining('--bk-spacer-height: 24')
    )
    horizontalSpacers.forEach((spacer) => {
      expect(spacer).toHaveAttribute(
        'style',
        expect.stringContaining('--bk-spacer-width: 8')
      )
    })
  })

  it('snaps the final box height if snapping="height"', () => {
    render(
      <Box className="layout" block={[6, 10]} snapping="height">
        Some content
      </Box>
    )
    const spacers = screen.getAllByTestId('spacer')
    const verticalSpacers = spacers.filter((s) =>
      s.getAttribute('style')?.includes('--bk-spacer-width: 100%')
    )
    // For our "height" mode mock, we expect top to be 8 and bottom to be 16.
    expect(verticalSpacers[0]).toHaveAttribute(
      'style',
      expect.stringContaining('--bk-spacer-height: 8')
    )
    expect(verticalSpacers[1]).toHaveAttribute(
      'style',
      expect.stringContaining('--bk-spacer-height: 16')
    )
  })

  it('passes snapEdge through to the baseline measurement hook', () => {
    render(
      <Box snapping="height" snapEdge="top">
        Top snap
      </Box>
    )

    expect(useBaseline).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ snapEdge: 'top' })
    )
  })

  it('applies custom className and style props', () => {
    render(
      <Box
        className="my-custom-box"
        style={{ backgroundColor: 'red', '--my-var': 'foo' } as CSSProperties}
      >
        Something
      </Box>
    )
    const boxEl = screen.getByTestId('box')
    expect(boxEl).toHaveClass('my-custom-box')
    // Instead of toHaveStyle, check the inline style attribute.
    const inlineStyle = boxEl.getAttribute('style') || ''
    expect(inlineStyle).toContain('background-color: red')
    expect(inlineStyle).toContain('--my-var: foo')
  })
})
