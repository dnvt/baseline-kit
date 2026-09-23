import * as React from 'react'
import { render as renderBase } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { Config } from '@baseline-kit/react'

export * from '@testing-library/react'

export function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const Wrapper = ({ children }: React.PropsWithChildren) =>
    React.createElement(Config, { domDiagnostics: true, children })
  return renderBase(ui, { ...options, wrapper: Wrapper })
}

export const renderPlain = renderBase
