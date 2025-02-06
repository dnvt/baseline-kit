import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CSSProperties } from 'react'
import { Layout } from '@components'
import * as hooks from '@hooks'
import { parsePadding } from '@utils'

// Mocks
vi.mock('@hooks', () => ({
  useConfig: vi.fn(),
  useDebug: vi.fn(),
  useMeasure: vi.fn(),
  useBaseline: vi.fn(),
  useVirtual: vi.fn(),
}))
vi.mock('@utils', () => ({
  parsePadding: vi.fn(),
  mergeStyles: (...args: any[]) => Object.assign({}, ...args),
  mergeClasses: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))
vi.mock('@components/Padder', () => ({
  Padder: ({ children, width, height }: { children: React.ReactNode; width?: string; height?: string }) => (
    <div
      data-testid="layout"
      style={{ '--bk-padder-width': width || '100%', '--bk-padder-height': height || '100%' } as CSSProperties}
    >
      {children}
    </div>
  ),
}))

describe('Layout Component', () => {
  // Helper that returns the inner grid element (the direct child of the Padder)
  const getGrid = (): HTMLElement => {
    const padderElement = screen.getByTestId('layout')
    if (!padderElement.firstElementChild) {
      throw new Error('No grid element found inside layout')
    }
    return padderElement.firstElementChild as HTMLElement
  }

  beforeEach(() => {
    vi.mocked(hooks.useConfig).mockImplementation(() => ({
      base: 8,
      debugging: 'visible',
      colors: { line: '#ff0000' },
    }))
    vi.mocked(hooks.useMeasure).mockReturnValue({
      width: 1024,
      height: 768,
      refresh: vi.fn(),
    })
    vi.mocked(hooks.useBaseline).mockImplementation((_, { spacing }) => ({
      padding: {
        top: spacing.initTop,
        bottom: spacing.initBottom,
        left: spacing.left,
        right: spacing.right,
      },
      isAligned: true,
      height: 0,
    }))
    // Updated useDebug returns extra "debugging" field.
    vi.mocked(hooks.useDebug).mockImplementation((debug, configDefault) => {
      const effective = debug ?? configDefault
      return {
        isShown: effective === 'visible',
        isHidden: effective === 'hidden',
        isNone: effective === 'none',
        debugging: effective,
      }
    })
    vi.mocked(parsePadding).mockImplementation((props) => ({
      initTop: (props.block && props.block[0]) || 0,
      initBottom: (props.block && props.block[1]) || 0,
      left: (props.inline && props.inline[0]) || 0,
      right: (props.inline && props.inline[1]) || 0,
    }))
  })

  afterEach(() => vi.clearAllMocks())

  it('renders with default grid layout', () => {
    render(<Layout>Content</Layout>)
    const grid = getGrid()
    expect(grid).toHaveStyle({
      display: 'grid',
      'grid-template-columns': 'repeat(auto-fit, minmax(100px, 1fr))',
      'grid-template-rows': 'auto',
    })
  })

  it('applies column template from number prop', () => {
    render(<Layout columns={3}>Test</Layout>)
    const grid = getGrid()
    expect(grid).toHaveStyle({
      'grid-template-columns': 'repeat(3, 1fr)',
    })
  })

  it('handles array column definition', () => {
    render(<Layout columns={['100px', 2, '1fr']}>Test</Layout>)
    const grid = getGrid()
    expect(grid).toHaveStyle({
      'grid-template-columns': '100px 2px 1fr',
    })
  })

  it('applies gap and alignment props', () => {
    render(<Layout gap="1rem" justifyContent="center" alignItems="stretch">Test</Layout>)
    const grid = getGrid()
    expect(grid).toHaveStyle({
      gap: '1rem',
      'justify-content': 'center',
      'align-items': 'stretch',
    })
  })

  it('integrates with Padder component', () => {
    render(<Layout block={[10, 20]} inline={8}>Test</Layout>)
    // With the updated mock, the Padder now uses data-testid "layout"
    const padder = screen.getByTestId('layout')
    expect(padder).toBeInTheDocument()
    expect(padder).toHaveStyle({
      '--bk-padder-width': '100%',
      '--bk-padder-height': '100%',
    })
  })

  it('handles debug modes correctly', () => {
    const { rerender } = render(<Layout debugging="visible">Test</Layout>)
    let grid = getGrid()
    expect(grid).toHaveClass('visible')

    rerender(<Layout debugging="hidden">Test</Layout>)
    grid = getGrid()

    rerender(<Layout debugging="none">Test</Layout>)
    grid = getGrid()
    expect(grid).not.toHaveClass('visible')
  })

  it('applies custom className and style', () => {
    render(<Layout className="custom-layout" style={{ '--custom': 'value' } as CSSProperties}>Test</Layout>)
    const grid = getGrid()
    expect(grid).toHaveClass('custom-layout')
    expect(grid).toHaveStyle('--custom: value')
  })
})
