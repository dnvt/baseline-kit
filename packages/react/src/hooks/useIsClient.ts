import { useEffect, useState } from 'react'

/**
 * Hook to determine if the code is running on the client side.
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}
