import * as React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Stack } from '@components'
import * as hooks from '@hooks'
import { parsePadding } from '@utils'

// Mock hooks from @hooks
vi.mock('@hooks', () => ({
  useConfig: vi.fn(),
  useDebug: vi.fn(),
  useMeasure: vi.fn(),
  useBaseline: vi.fn(),
  useVirtual: vi.fn(),
}))

// Mock utilities from @utils
vi.mock('@utils', () => ({
  parsePadding: vi.fn(),
  mergeStyles: (...args: any[]) => Object.assign({}, ...args),
  mergeClasses: (...classes: any[]) => classes.filter(Boolean).join(' '),
  formatValue: (value: any, defaultValue: number | undefined) => {
    if (value === undefined && defaultValue !== undefined) {
      return `${defaultValue}px`
    }
    if (typeof value === 'number') {
      return `${value}px`
    }
    return value || ''
  },
}))

// Update the mock for Padder so that it removes indicatorNode from the DOM
// and the inner container gets a dedicated test id
vi.mock('@components/Padder', () => ({
  Padder: ({ children, indicatorNode, ...rest }: {
    children: React.ReactNode;
    indicatorNode?: any;
    [key: string]: any
  }) => (
    // Render a wrapping div (e.g. with data-testid="padder") that simply renders its children.
    // In your actual Stack component, you should assign the inner container a test id like "stack".
    <div {...rest} data-testid="padder">
      {children}
    </div>
  ),
}))

// For simplicity, assume styles.module.css returns the following:
vi.mock('./styles.module.css', () => ({
  default: { stack: 'stack' },
}))

describe('StackComponent', () => {
  beforeEach(() => {
    // Mock useConfig to return base and debugging info.
    vi.mocked(hooks.useConfig).mockImplementation((component) => ({
      base: 8,
      debugging: 'visible',
      colors: { line: 'red', flat: 'blue', indice: 'green' },
    }))

    // Default measurement returns container size 1024×768.
    vi.mocked(hooks.useMeasure).mockReturnValue({
      width: 1024,
      height: 768,
      refresh: vi.fn(),
    })

    // Mock useBaseline to return fixed snapped padding.
    // (For example, block [10,20] and inline [5,15] are snapped to [8,16].)
    vi.mocked(hooks.useBaseline).mockImplementation((_, { spacing }) => ({
      padding: {
        top: 8,
        bottom: 16,
        left: 8,
        right: 16,
      },
      isAligned: true,
      height: 0,
    }))

    // Mock useDebug based on the debugging prop.
    vi.mocked(hooks.useDebug).mockImplementation((debug) => ({
      isShown: debug === 'visible',
      isHidden: debug === 'hidden',
      isNone: debug === 'none',
      debugging: debug,
    }))

    // Mock parsePadding so our spacing props are processed consistently.
    vi.mocked(parsePadding).mockImplementation((props) => ({
      initTop: props.block?.[0] || 0,
      initBottom: props.block?.[1] || 0,
      left: props.inline?.[0] || 0,
      right: props.inline?.[1] || 0,
    }))
  })

  afterEach(() => vi.clearAllMocks())

  it('renders with default props', () => {
    render(<Stack>Content</Stack>)
    const container = screen.getByTestId('stack') // Changed from 'stack-container'
    expect(container).toHaveStyle({
      display: 'flex',
      'flex-direction': 'row',
      'justify-content': 'flex-start',
      'align-items': 'stretch',
      width: 'fit-content',
      height: 'fit-content',
    })
  })

  it('applies custom layout props', () => {
    render(
      <Stack direction="column" justify="center" align="flex-end">
        Test
      </Stack>,
    )
    const container = screen.getByTestId('stack') // Changed from 'stack-container'
    expect(container).toHaveStyle({
      'flex-direction': 'column',
      'justify-content': 'center',
      'align-items': 'flex-end',
    })
  })

  it('merges custom className and style', () => {
    render(
      <Stack className="custom" style={{ background: 'red' }}>
        Test
      </Stack>,
    )
    const container = screen.getByTestId('stack') // Changed from 'stack-container'
    expect(container.className).toContain('custom')
    expect(container).toHaveStyle('background: red')
  })

  it('applies direct padding when debugging="none"', () => {
    vi.mocked(hooks.useDebug).mockImplementation(() => ({
      isShown: false,
      isHidden: false,
      isNone: true,
      debugging: 'none',
    }))
    render(
      <Stack debugging="none" block={[10, 20]} inline={[5, 15]}>
        Test
      </Stack>,
    )
    const container = screen.getByTestId('stack') // Changed from 'stack-container'
    expect(container).toHaveStyle({
      'padding-block': '8px 16px',
      'padding-inline': '8px 16px',
    })
  })
})
