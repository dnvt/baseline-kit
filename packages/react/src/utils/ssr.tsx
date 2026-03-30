/**
 * React-specific SSR utilities (ClientOnly component)
 */
import * as React from 'react'
import { useIsClient } from '../hooks/useIsClient'

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * A utility component that only renders its children on the client side.
 * @internal Not part of the public API
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isClient = useIsClient()

  if (!isClient) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
