import { useEffect, useState } from 'react'

/**
 * Hook to determine if the code is running on the client side.
 *
 * Safely detects client-side environments and provides a boolean flag
 * that can be used for conditional rendering of client-only components.
 *
 * @returns Boolean indicating if the code is running in a browser environment
 *
 * @example
 * ```tsx
 * function ClientOnlyComponent() {
 *   const isClient = useIsClient()
 *
 *   if (!isClient) {
 *     return null // or a placeholder/skeleton
 *   }
 *
 *   return <div>This only renders on the client</div>
 * }
 * ```
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
