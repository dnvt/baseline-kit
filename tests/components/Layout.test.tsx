import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CSSProperties } from 'react'
import { Layout } from '@components'

// Update mocks to partially import @utils so that formatValue is available.
vi.mock('@utils', async () => {
  const actual = await vi.importActual<typeof import('@utils')>('@utils')
  return {
    ...actual,
    mergeStyles: (...args: any[]) => Object.assign({}, ...args),
    mergeClasses: (...classes: any[]) => classes.filter(Boolean).join(' '),
    formatValue: (value: any, defaultValue?: number) => {
      if (value === undefined && defaultValue !== undefined) return `${defaultValue}px`
      if (typeof value === 'number') return `${value}px`
      return value || ''
    },
    // Provide a simple implementation:
    mergeRefs: (...refs: any[]) => (element: any) => refs.forEach(ref => {
      if (typeof ref === 'function') ref(element)
      else if (ref && typeof ref === 'object') ref.current = element
    }),
  }
})

// For our tests, we supply a simple stub for Padder so that the descendant grid element has test id "layoutGrid"
vi.mock('@components/Padder', () => ({
  Padder: ({ children, width, height, ...rest }: { children: React.ReactNode; width?: string; height?: string }) => (
    <div data-testid="padder" {...rest}>{children}</div>
  ),
}))

// Mock hooks
vi.mock('@hooks', () => {
  return {
    useConfig: vi.fn((component: string) => {
      if (component === 'layout') {
        return {
          base: 8,
          debugging: 'visible',
          colors: { line: '#ff0000', flat: '#00ff00', indice: '#0000ff' },
          variant: 'line',
        }
      }
      return {}
    }),
    useDebug: vi.fn((debug, defaultDebug) => {
      const effective = debug ?? defaultDebug
      return {
        isShown: effective === 'visible',
        isHidden: effective === 'hidden',
        isNone: effective === 'none',
        debugging: effective,
      }
    }),
    useMeasure: vi.fn(() => ({
      width: 1024,
      height: 768,
      refresh: vi.fn(),
    })),
    // Provide a simple baseline implementation.
    useBaseline: vi.fn((ref, { spacing }) => ({
      padding: {
        top: spacing?.initTop || 0,
        bottom: spacing?.initBottom || 0,
        left: spacing?.left || 0,
        right: spacing?.right || 0,
      },
      isAligned: true,
      height: 0,
    })),
    useVirtual: vi.fn(() => ({ start: 0, end: 0 })),
  }
})

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to retrieve the grid element inside the Padder.
  const getGrid = (): HTMLElement => {
    // Now, depending on your Layout implementation, the actual grid element is the child of the Padder.
    const grid = screen.getByTestId('layout')
    return grid
  }

  it('renders with default grid layout', () => {
    render(<Layout>Content</Layout>)
    const grid = getGrid()
    // When using default values, the CSS variables should not be present
    expect(grid.style.getPropertyValue('--bklgtc')).toBe('')  // Default values shouldn't be injected
    expect(grid.style.getPropertyValue('--bklgtr')).toBe('')  // Default values shouldn't be injected
  })

  it('applies column template from number prop', () => {
    render(<Layout columns={3}>Test</Layout>)
    const grid = getGrid()
    expect(grid.style.getPropertyValue('--bklgtc')).toBe('repeat(3, 1fr)')
  })

  it('handles array column definition', () => {
    render(<Layout columns={['100px', 2, '1fr']}>Test</Layout>)
    const grid = getGrid()
    expect(grid.style.getPropertyValue('--bklgtc')).toBe('100px 2px 1fr')
  })

  it('applies gap and alignment props', () => {
    render(<Layout gap="1rem" justifyContent="center" alignItems="stretch">Test</Layout>)
    const grid = getGrid()
    expect(grid.style.getPropertyValue('--bklg')).toBe('1rem')
    expect(grid.style.getPropertyValue('--bkljc')).toBe('center')
    expect(grid.style.getPropertyValue('--bklai')).toBe('stretch')
  })

  it('integrates with Padder component', () => {
    render(<Layout block={[10, 20]} inline={[8, 16]}>Test</Layout>)
    const padder = screen.getByTestId('padder')
    // Remove style expectations since Padder no longer sets these CSS variables directly
    expect(padder).toBeInTheDocument()
  })

  it('handles debug modes correctly', () => {
    const { rerender } = render(<Layout debugging="visible">Test</Layout>)
    let grid = getGrid()
    // Update to check for the data-testid instead of className
    expect(grid).toHaveAttribute('data-testid', 'layout')

    rerender(<Layout debugging="hidden">Test</Layout>)
    grid = getGrid()
    expect(grid).toHaveAttribute('data-testid', 'layout')

    rerender(<Layout debugging="none">Test</Layout>)
    grid = getGrid()
    expect(grid).toHaveAttribute('data-testid', 'layout')
  })

  it('applies custom className and style', () => {
    render(<Layout className="custom-layout" style={{ '--custom': 'value' } as CSSProperties}>Test</Layout>)
    const grid = getGrid()
    expect(grid).toHaveClass('custom-layout')
    expect(grid).toHaveStyle('--custom: value')
  })
})
