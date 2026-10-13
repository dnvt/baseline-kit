import { screen } from '@testing-library/react'
import { render } from '../render'
import '@testing-library/jest-dom'
import { Config, Padder } from '@baseline-kit/react'
import * as HooksModule from '@baseline-kit/react/hooks'

describe('Padder', () => {
  beforeEach(() => {
    // Mock "useConfig"
    vi.spyOn(HooksModule, 'useConfig').mockImplementation(
      (component: string) => {
        if (component === 'padder') {
          return {
            base: 8,
            color: '#AA00AA',
            debugging: 'hidden',
            domDiagnostics: true,
          } as never
        }
        if (component === 'spacer') {
          return {
            domDiagnostics: true,
            base: 8,
            variant: 'line',
            debugging: 'hidden',
            colors: {
              line: 'red',
              flat: 'blue',
              indice: 'green',
            },
          } as any
        }
        return {} as any
      }
    )

    // Mock useBaseline: snapping returns adjusted padding values; `none`
    // (used before hydration and in ssrMode) returns the explicit padding.
    vi.spyOn(HooksModule, 'useBaseline').mockImplementation(
      (_ref, options) => ({
        padding:
          options?.snapping === 'none'
            ? {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                ...(options.spacing as object),
              }
            : { top: 8, right: 16, bottom: 24, left: 8 },
        isAligned: true,
        height: 0,
      })
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('defaults to hidden from config, no .visible class', () => {
    render(<Padder>Child</Padder>)
    const padder = screen.getByTestId('padder')
    // We won't see "visible" class if "isShown" = false
    expect(padder.className).not.toMatch(/v/i)
    // And the style might have --bk-padder-color: #AA00AA
    expect(padder.style.getPropertyValue('--bkpd-c')).toBe('#AA00AA')
  })

  it('renders as visible if prop=visible', () => {
    render(<Padder debugging="visible">Child</Padder>)
    const padder = screen.getByTestId('padder')
    expect(padder.className).toMatch(/v/i)
  })

  it('sets width/height via custom properties', () => {
    render(
      <Padder width="200px" height="auto" debugging="visible">
        Child
      </Padder>
    )
    const padder = screen.getByTestId('padder')
    expect(padder.style.getPropertyValue('--bkpd-w')).toBe('200px')
    expect(padder.style.getPropertyValue('--bkpd-h')).toBe('auto')
  })

  it('renders children', () => {
    render(<Padder debugging="visible">Hello World</Padder>)
    screen.getByText('Hello World')
  })

  it('omits zero-padding spacers and keeps a stable content host', () => {
    render(
      <Padder debugging="visible" ssrMode>
        <button data-testid="padder-child">Child</button>
      </Padder>
    )

    const padder = screen.getByTestId('padder')
    expect(padder.firstElementChild?.className).toMatch(/content/)
    expect(padder.children).toHaveLength(1)
    expect(screen.getByTestId('padder-child').parentElement).toBe(
      padder.firstElementChild
    )
    expect(padder.querySelectorAll('[data-testid="spacer"]')).toHaveLength(0)
  })

  it('renders spacers if visible & not none => block/inline props', () => {
    render(
      <Padder block={[10, 20]} inline={[5, 15]} debugging="visible">
        Child
      </Padder>
    )
    const padder = screen.getByTestId('padder')
    // We expect 4 <Spacer data-testid="spacer" />
    const spacers = padder.querySelectorAll('[data-testid="spacer"]')
    expect(spacers.length).toBe(4)
  })

  it('uses direct padding if debugging="none"', () => {
    render(
      <Padder block={[10, 20]} inline={[5, 15]} debugging="none">
        Child
      </Padder>
    )
    const padder = screen.getByTestId('padder')
    // No <Spacer />
    expect(padder.querySelectorAll('[data-testid="spacer"]').length).toBe(0)
    // Inspect inline style for padding
    const styleAttr = padder.getAttribute('style') || ''
    // Adjust your expectations based on the adjusted padding from useBaseline
    expect(styleAttr).toContain('padding-block: 8px 24px')
    expect(styleAttr).toContain('padding-inline: 8px 16px')
    expect(padder.children).toHaveLength(0)
    expect(padder.textContent).toBe('Child')
  })
})

it('doesnt normilize the paddings with base of 1', () => {
  render(
    <Config base={1}>
      <Padder block={[10, 20]} inline={[5, 15]} debugging="none">
        Child
      </Padder>
    </Config>
  )
  const padder = screen.getByTestId('padder')
  expect(padder.querySelectorAll('[data-testid="spacer"]').length).toBe(0)
  const styleAttr = padder.getAttribute('style') || ''

  expect(styleAttr).toContain('padding-block: 10px 20px')
  expect(styleAttr).toContain('padding-inline: 5px 15px')
})
