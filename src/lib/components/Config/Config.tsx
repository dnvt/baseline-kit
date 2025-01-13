import { memo, type ReactNode } from 'react'
import { ConfigContext, Theme } from '@context'

type ConfigProps = {
  children: ReactNode
  config?: Theme
}

export const Config = memo(function Config({
  children,
  config,
}: ConfigProps) {
  return (
    <ConfigContext value={config ?? null}>
      {children}
    </ConfigContext>
  )
})