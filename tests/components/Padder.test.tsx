import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Padder } from '@components'
import * as HooksModule from '@/hooks/useConfig' // mock if needed

describe('Padder', () => {
  beforeEach(() => {
    // Mock "useConfig('padder')" if it returns { base, color, visibility }
    // Also mock "useConfig('spacer')" if <Spacer> uses that
    vi.spyOn(HooksModule, 'useConfig').mockImplementation((component: string) => {
      if (component === 'padder') {
        return { base: 8, color: '#AA00AA', visibility: 'hidden' } as never
      }
      if (component === 'spacer') {
        return {
          base: 8,
          variant: 'line',
          visibility: 'hidden',
          colors: {
            line: 'red', flat: 'blue', indice: 'green',
          },
        } as any
      }
      return {} as any
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('defaults to hidden from config, no .visible class', () => {
    render(<Padder>Child</Padder>)
    const padder = screen.getByTestId('padder')
    // We won't see "visible" class if "isShown"=false
    expect(padder.className).not.toMatch(/visible/i)
    // And the style might have --pdd-padder-color: #AA00AA
    expect(padder.style.getPropertyValue('--pdd-padder-color')).toBe('#AA00AA')
  })

  it('renders as visible if prop=visible', () => {
    render(<Padder debugging="visible">Child</Padder>)
    const padder = screen.getByTestId('padder')
    // We might see a hashed class: _visible_xxxx
    // Just check for "visible" substring or do a data attr approach
    expect(padder.className).toMatch(/visible/i)
  })

  it('sets width/height via custom properties', () => {
    render(
      <Padder width="200px" height="auto" debugging="visible">
        Child
      </Padder>,
    )
    const padder = screen.getByTestId('padder')
    expect(padder.style.getPropertyValue('--pdd-padder-width')).toBe('200px')
    expect(padder.style.getPropertyValue('--pdd-padder-height')).toBe('auto')
  })

  it('renders children', () => {
    render(<Padder debugging="visible">Hello World</Padder>)
    screen.getByText('Hello World')
  })

  it('renders spacers if visible & not none => block/inline props', () => {
    render(
      <Padder block={[10, 20]} inline={[5, 15]} debugging="visible">
        Child
      </Padder>,
    )
    const padder = screen.getByTestId('padder')
    // We expect 4 <Spacer data-testid="spacer" />
    const spacers = padder.querySelectorAll('[data-testid="spacer"]')
    expect(spacers.length).toBe(4)
  })

  it('uses direct padding if visibility="none"', () => {
    render(
      <Padder block={[10, 20]} inline={[5, 15]} debugging="none">
        Child
      </Padder>,
    )
    const padder = screen.getByTestId('padder')
    // No <Spacer />
    expect(padder.querySelectorAll('[data-testid="spacer"]').length).toBe(0)
    // Inspect inline style for "padding-block" & "padding-inline"
    // Instead of toHaveStyle => do a substring check
    const styleAttr = padder.getAttribute('style') || ''
    expect(styleAttr).toContain('padding-block: 8px 24px')
    expect(styleAttr).toContain('padding-inline: 8px 16px')
  })
})