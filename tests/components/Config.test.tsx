import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Config, DEFAULT_CONFIG } from '@components'

describe('Config component', () => {
  it('renders children and applies default CSS variables', () => {
    render(
      <Config>
        <div data-testid="child">Test Content</div>
      </Config>,
    )

    const child = screen.getByTestId('child')
    const wrapper = child.parentElement!
    const style = wrapper.getAttribute('style')

    expect(style).toContain(`--pdd-base: ${DEFAULT_CONFIG.base}px`)
    expect(style).toContain(`--pdd-baseline-color-line: ${DEFAULT_CONFIG.baseline.colors.line}`)
    expect(style).toContain(`--pdd-baseline-color-flat: ${DEFAULT_CONFIG.baseline.colors.flat}`)
    expect(style).toContain(`--pdd-guide-color-line: ${DEFAULT_CONFIG.guide.colors.line}`)
    expect(style).toContain(`--pdd-guide-color-pattern: ${DEFAULT_CONFIG.guide.colors.pattern}`)
  })

  it('allows overriding base unit', () => {
    render(
      <Config base={16}>
        <div data-testid="child">Content</div>
      </Config>,
    )

    const wrapper = screen.getByTestId('child').parentElement!
    const style = wrapper.getAttribute('style')
    expect(style).toContain('--pdd-base: 16px')
  })

  it('allows overriding baseline config', () => {
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
        <div data-testid="child">Content</div>
      </Config>,
    )

    const wrapper = screen.getByTestId('child').parentElement!
    const style = wrapper.getAttribute('style')
    expect(style).toContain('--pdd-baseline-color-line: #FF0000')
    expect(style).toContain('--pdd-baseline-color-flat: #00FF00')
  })

  it('allows overriding guide config', () => {
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
        <div data-testid="child">Content</div>
      </Config>,
    )

    const wrapper = screen.getByTestId('child').parentElement!
    const style = wrapper.getAttribute('style')
    expect(style).toContain('--pdd-guide-color-line: #FF0000')
    expect(style).toContain('--pdd-guide-color-pattern: #00FF00')
    expect(style).toContain('--pdd-guide-color-auto: #0000FF')
    expect(style).toContain('--pdd-guide-color-fixed: #FFFF00')
  })

  it('allows overriding spacer config', () => {
    render(
      <Config
        spacer={{
          variant: 'flat',
          debugging: 'visible',
          colors: {
            line: '#FF0000',
            flat: '#00FF00',
            indice: '#0000FF',
          },
        }}
      >
        <div data-testid="child">Content</div>
      </Config>,
    )

    const wrapper = screen.getByTestId('child').parentElement!
    const style = wrapper.getAttribute('style')
    expect(style).toContain('--pdd-spacer-color-line: #FF0000')
    expect(style).toContain('--pdd-spacer-color-flat: #00FF00')
    expect(style).toContain('--pdd-spacer-color-indice: #0000FF')
  })

  it('allows overriding box config', () => {
    render(
      <Config
        box={{
          debugging: 'visible',
          colors: {
            line: '#FF0000',
            flat: '#00FF00',
            indice: '#0000FF',
          },
        }}
      >
        <div data-testid="child">Content</div>
      </Config>,
    )

    const wrapper = screen.getByTestId('child').parentElement!
    const style = wrapper.getAttribute('style')
    expect(style).toContain('--pdd-box-color-line: #FF0000')
    expect(style).toContain('--pdd-box-color-flat: #00FF00')
    expect(style).toContain('--pdd-box-color-indice: #0000FF')
  })

  it('allows overriding padder config', () => {
    render(
      <Config
        padder={{
          debugging: 'visible',
          color: '#FF0000',
        }}
      >
        <div data-testid="child">Content</div>
      </Config>,
    )

    const wrapper = screen.getByTestId('child').parentElement!
    const style = wrapper.getAttribute('style')
    expect(style).toContain('--pdd-padder-color: #FF0000')
  })

  it('merges nested configs correctly', () => {
    render(
      <Config base={16}>
        <Config
          base={24}
          guide={{ debugging: 'visible' }}
          baseline={{ variant: 'flat' }}
        >
          <div data-testid="nested-child">Nested Content</div>
        </Config>
      </Config>,
    )

    const wrapper = screen.getByTestId('nested-child').parentElement!
    const style = wrapper.getAttribute('style')
    expect(style).toContain('--pdd-base: 24px')
  })

  it('maintains default values for non-overridden properties', () => {
    render(
      <Config
        guide={{ debugging: 'visible' }} // Only override debugging
      >
        <div data-testid="child">Content</div>
      </Config>,
    )

    const wrapper = screen.getByTestId('child').parentElement!
    const style = wrapper.getAttribute('style')
    expect(style).toContain(`--pdd-guide-color-line: ${DEFAULT_CONFIG.guide.colors.line}`)
    expect(style).toContain(`--pdd-guide-color-pattern: ${DEFAULT_CONFIG.guide.colors.pattern}`)
  })

  it('handles partial color overrides correctly', () => {
    render(
      <Config
        guide={{
          colors: {
            ...DEFAULT_CONFIG.guide.colors,
            line: '#FF0000', // Only override line color
          },
        }}
      >
        <div data-testid="child">Content</div>
      </Config>,
    )

    const wrapper = screen.getByTestId('child').parentElement!
    const style = wrapper.getAttribute('style')
    expect(style).toContain('--pdd-guide-color-line: #FF0000')
    expect(style).toContain(`--pdd-guide-color-pattern: ${DEFAULT_CONFIG.guide.colors.pattern}`)
  })
})
