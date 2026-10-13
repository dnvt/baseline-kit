import { act, screen } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { render, renderPlain } from '../render'
import '@testing-library/jest-dom'
import { Box, Config, Spacer } from '@baseline-kit/react'
import {
  DEFAULT_CONFIG,
  useDefaultConfig,
  createCSSVariables,
} from '@baseline-kit/react/components/Config'

describe('Config component', () => {
  it('omits library diagnostics by default and supports false-to-true opt-in', () => {
    const ui = (domDiagnostics: boolean) => (
      <Config domDiagnostics={domDiagnostics}>
        <Spacer
          height={24}
          data-user-probe="preserved"
          aria-label="sample spacer"
        />
      </Config>
    )
    const { container, rerender } = renderPlain(ui(false))
    let spacer = container.firstElementChild
    expect(spacer).not.toHaveAttribute('data-testid')
    expect(spacer).not.toHaveAttribute('data-height')
    expect(spacer).not.toHaveAttribute('data-variant')
    expect(spacer).toHaveAttribute('data-user-probe', 'preserved')
    expect(spacer).toHaveAttribute('aria-label', 'sample spacer')

    rerender(ui(true))
    spacer = container.firstElementChild
    expect(spacer).toHaveAttribute('data-testid', 'spacer')
    expect(spacer).toHaveAttribute('data-height', '24px')
    expect(spacer).toHaveAttribute('data-variant', 'line')
    expect(spacer).toHaveAttribute('data-user-probe', 'preserved')
  })

  // Create a test consumer component that uses the config context
  const TestConsumer = ({
    children,
    ...props
  }: React.HTMLProps<HTMLDivElement>) => {
    const config = useDefaultConfig()
    return (
      <div
        data-testid={props['data-testid']}
        style={createCSSVariables(config)}
        {...props}
      >
        {children}
      </div>
    )
  }

  describe('with default configuration', () => {
    it('renders children and applies default CSS variables', () => {
      render(
        <Config>
          <TestConsumer data-testid="child">Test Content</TestConsumer>
        </Config>
      )

      const child = screen.getByTestId('child')
      const style = child.getAttribute('style') || ''
      expect(style).toContain(`--bk-base: ${DEFAULT_CONFIG.base}px`)
      expect(style).toContain(
        `--bkbl-cl: ${DEFAULT_CONFIG.baseline.colors.line}`
      )
      expect(style).toContain(
        `--bkbl-cf: ${DEFAULT_CONFIG.baseline.colors.flat}`
      )
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })

  describe('overriding configuration', () => {
    it('allows overriding the base unit', () => {
      render(
        <Config base={16}>
          <TestConsumer data-testid="child">Content</TestConsumer>
        </Config>
      )
      const child = screen.getByTestId('child')
      const style = child.getAttribute('style') || ''
      expect(style).toContain('--bk-base: 16px')
    })

    it('allows overriding the baseline config', () => {
      render(
        <Config
          baseline={{
            variant: 'flat',
            debugging: 'visible',
            colors: {
              line: '#FF0000',
              flat: '#00FF00',
            },
          }}
        >
          <TestConsumer data-testid="child">Content</TestConsumer>
        </Config>
      )
      const child = screen.getByTestId('child')
      const style = child.getAttribute('style') || ''
      expect(style).toContain('--bkbl-cl: #FF0000')
      expect(style).toContain('--bkbl-cf: #00FF00')
    })

    it('allows overriding the guide config', () => {
      render(
        <Config
          guide={{
            variant: 'pattern',
            debugging: 'visible',
            colors: {
              line: '#FF0000',
              pattern: '#00FF00',
              auto: '#0000FF',
              fixed: '#FFFF00',
            },
          }}
        >
          <TestConsumer data-testid="child">Content</TestConsumer>
        </Config>
      )
      const child = screen.getByTestId('child')
      const style = child.getAttribute('style') || ''
      expect(style).toContain('--bkgd-cl: #FF0000')
      expect(style).toContain('--bkgd-cp: #00FF00')
      expect(style).toContain('--bkgd-ca: #0000FF')
      expect(style).toContain('--bkgd-cf: #FFFF00')
    })
  })

  describe('nested configuration', () => {
    it('merges nested configs correctly', () => {
      render(
        <Config base={16}>
          <Config
            base={24}
            guide={{ debugging: 'visible' }}
            baseline={{ variant: 'flat' }}
          >
            <TestConsumer data-testid="nested-child">
              Nested Content
            </TestConsumer>
          </Config>
        </Config>
      )
      const child = screen.getByTestId('nested-child')
      const style = child.getAttribute('style') || ''
      expect(style).toContain('--bk-base: 24px')
    })
  })

  describe('default value preservation', () => {
    it('maintains default values for non-overridden properties', () => {
      render(
        <Config guide={{ debugging: 'visible' }}>
          <TestConsumer data-testid="child">Content</TestConsumer>
        </Config>
      )
      const child = screen.getByTestId('child')
      const style = child.getAttribute('style') || ''
      expect(style).toContain(`--bkgd-cl: ${DEFAULT_CONFIG.guide.colors.line}`)
      expect(style).toContain(
        `--bkgd-cp: ${DEFAULT_CONFIG.guide.colors.pattern}`
      )
    })

    it('handles partial color overrides correctly', () => {
      render(
        <Config
          guide={{
            colors: {
              line: '#FF0000', // Only override line color
            },
          }}
        >
          <TestConsumer data-testid="child">Content</TestConsumer>
        </Config>
      )
      const child = screen.getByTestId('child')
      const style = child.getAttribute('style') || ''
      expect(style).toContain('--bkgd-cl: #FF0000')
      expect(style).toContain(
        `--bkgd-cp: ${DEFAULT_CONFIG.guide.colors.pattern}`
      )
    })
  })

  describe('actual component consumers', () => {
    it('propagates Config colors to Box without a test-only wrapper', () => {
      render(
        <Config
          box={{
            debugging: 'visible',
            colors: {
              line: '#ff0000',
              flat: '#00ff00',
              text: '#0000ff',
            },
          }}
        >
          <Box>Box content</Box>
        </Config>
      )

      expect(screen.getByTestId('box').getAttribute('style')).toContain(
        '--bkbx-cl: #ff0000'
      )
    })

    it('propagates Config colors to Spacer without a test-only wrapper', () => {
      render(
        <Config
          spacer={{
            debugging: 'visible',
            colors: {
              line: '#ff0000',
              flat: '#00ff00',
              text: '#0000ff',
            },
          }}
        >
          <Spacer height={16} variant="flat" />
        </Config>
      )

      expect(screen.getByTestId('spacer').getAttribute('style')).toEqual(
        expect.stringContaining('--bksp-cf: #00ff00')
      )
    })

    it('updates actual consumers when a Config scope changes', () => {
      const { rerender } = render(
        <Config
          box={{
            debugging: 'visible',
            colors: {
              line: '#ff0000',
              flat: '#00ff00',
              text: '#0000ff',
            },
          }}
        >
          <Box>Box content</Box>
        </Config>
      )

      expect(screen.getByTestId('box').getAttribute('style')).toContain(
        '--bkbx-cl: #ff0000'
      )

      rerender(
        <Config
          box={{
            debugging: 'visible',
            colors: {
              line: '#0000ff',
              flat: '#00ff00',
              text: '#ff0000',
            },
          }}
        >
          <Box>Box content</Box>
        </Config>
      )

      expect(screen.getByTestId('box').getAttribute('style')).toContain(
        '--bkbx-cl: #0000ff'
      )
    })
  })
})

describe('Config rem base', () => {
  class ProbeObserver {
    static instances: ProbeObserver[] = []
    constructor(private callback: ResizeObserverCallback) {
      ProbeObserver.instances.push(this)
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    fire() {
      this.callback([], this as unknown as ResizeObserver)
    }
  }
  let rootSize = '16px'
  const BaseProbe = () => <output>{useDefaultConfig().base}</output>
  const ui = (
    <Config base="0.5rem">
      <Config domDiagnostics>
        <BaseProbe />
      </Config>
    </Config>
  )

  beforeEach(() => {
    ProbeObserver.instances = []
    vi.stubGlobal('ResizeObserver', ProbeObserver)
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (element: Element) =>
        ({
          fontSize: element === document.documentElement ? rootSize : '16px',
        }) as CSSStyleDeclaration
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    rootSize = '16px'
  })

  it('resolves against the live root font size and follows it', () => {
    rootSize = '20px'
    const { container } = renderPlain(ui)
    expect(container.textContent).toBe('10')

    act(() => {
      rootSize = '17px'
      ProbeObserver.instances[0].fire()
    })
    expect(container.textContent).toBe('8.5')
  })

  it('renders the 16px resolution on the server and hydrates without a mismatch', async () => {
    rootSize = '20px'
    const html = renderToString(ui)
    expect(html).toBe('<output>8</output>')

    const container = document.createElement('div')
    container.innerHTML = html
    document.body.appendChild(container)
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const recoverable = vi.fn()
    const root = await act(async () =>
      hydrateRoot(container, ui, { onRecoverableError: recoverable })
    )
    expect(container.textContent).toBe('10')
    expect(recoverable).not.toHaveBeenCalled()
    expect(errors).not.toHaveBeenCalled()
    act(() => root.unmount())
    container.remove()
  })
})
