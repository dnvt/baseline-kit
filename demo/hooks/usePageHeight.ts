import { useLayoutEffect } from 'react'

export function usePageHeight(onHeightChange: (height: number) => void) {
  useLayoutEffect(() => {
    const updatePageHeight = () => {
      const height = document.documentElement.scrollHeight
      onHeightChange(height)
    }

    updatePageHeight()
    window.addEventListener('resize', updatePageHeight)

    const observer = new MutationObserver(updatePageHeight)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('resize', updatePageHeight)
      observer.disconnect()
    }
  }, [onHeightChange])
}