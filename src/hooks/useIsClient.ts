import { useEffect, useState } from 'react'

/**
 * Hook to determine if the code is running on the client side.
 *
 * @returns Boolean indicating if the code is running in a browser environment
 */
export function useIsClient() {
  // Start with false for SSR
  const [isClient, setIsClient] = useState(false)

  // Only run once on mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}
