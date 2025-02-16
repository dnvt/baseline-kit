import * as React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Stack } from '@components'
import * as hooks from '@hooks'

// Mock hooks from @hooks
vi.mock('@hooks', () => ({
  useConfig: vi.fn((component: string) => ({
    base: 8,
    debugging: 'visible',
    colors: { line: 'red', flat: 'blue', indice: 'green' },
    variant: 'line',
  })),
  useDebug: vi.fn((debug) => ({
    isShown: debug === 'visible',
    isHidden: debug === 'hidden',
    isNone: debug === 'none',
    debugging: debug,
  })),
  useMeasure: vi.fn(() => ({ width: 1024, height: 768, refresh: vi.fn() })),
  useBaseline: vi.fn((_, { spacing }) => ({
    padding: { top: 8, bottom: 16, left: 8, right: 16 },
    isAligned: true,
    height: 0,
  })),
  useVirtual: vi.fn(() => ({ start: 0, end: 0 })),
}))

// Mock @utils
vi.mock('@utils', async () => {
  const actual = await vi.importActual('@utils')
  return {
    ...actual,
    mergeRefs: (...refs: any[]) => (element: any) => {
      refs.forEach(ref => {
        if (typeof ref === 'function') ref(element)
        else if (ref && typeof ref === 'object') ref.current = element
      })
    },
  }
})

describe('StackComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default props', () => {
    render(<Stack>Content</Stack>)
    const stack = screen.getByTestId('stack')
    const styleAttr = stack.getAttribute('style') || ''

    // Check the style attribute string for flex properties
    expect(styleAttr).toContain('flex-direction: row')
    expect(styleAttr).toContain('justify-content: flex-start')
    expect(styleAttr).toContain('align-items: stretch')
  })

  it('applies custom layout props', () => {
    render(
      <Stack direction="column" justify="center" align="flex-end">
        Content
      </Stack>,
    )
    const stack = screen.getByTestId('stack')
    expect(stack).toHaveStyle({
      'flex-direction': 'column',
      'justify-content': 'center',
      'align-items': 'flex-end',
    })
  })

  it('merges custom className and style', () => {
    render(
      <Stack className="custom" style={{ background: 'red' }}>
        Content
      </Stack>,
    )
    const stack = screen.getByTestId('stack')
    expect(stack).toHaveClass('custom')
    expect(stack).toHaveStyle({ background: 'red' })
  })

  it('applies direct padding when debugging="none"', () => {
    render(
      <Stack debugging="none" block={[10, 20]} inline={[5, 15]}>
        Content
      </Stack>
    )
    const stack = screen.getByTestId('stack')
    const styleAttr = stack.getAttribute('style') || ''

    // Check the style attribute string for padding properties
    expect(styleAttr).toContain('padding-block: 8px 16px')
    expect(styleAttr).toContain('padding-inline: 8px 16px')
  })
})
