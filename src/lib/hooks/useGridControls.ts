import { type CSSProperties, type Dispatch, type HTMLAttributes, useCallback } from 'react'
import { GRID_ALIGNMENTS } from '@types'
import { GRID } from '@utils'
import type { PGActions, PGConfig, PGCustomProperties, PGState } from '@components'

// Define a type for grid props
type GridProps<T> = T & {
  style?: Partial<CSSProperties & PGCustomProperties>
  [key: string]: unknown
}

export function useGridControls(
  _state: PGState,
  dispatch: Dispatch<PGActions>,
): {
  getValidatedConfig: (config: Partial<PGConfig>) => Partial<PGConfig>
  updateConfig: (config: Partial<PGConfig>) => void
  updateStyles: (styles: Partial<PGCustomProperties>) => void
} {
  const updateConfig = useCallback((config: Partial<PGConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config })
  }, [dispatch])

  const updateStyles = useCallback((styles: Partial<PGCustomProperties>) => {
    dispatch({ type: 'UPDATE_STYLES', payload: styles })
  }, [dispatch])

  const getValidatedConfig = useCallback((config: Partial<PGConfig>): Partial<PGConfig> => {
    return {
      ...config,
      base: config.base !== undefined
        ? Math.max(GRID.LIMITS.BASE.MIN, Math.min(config.base, GRID.LIMITS.BASE.MAX))
        : undefined,
      align: config.align && GRID_ALIGNMENTS.includes(config.align)
        ? config.align
        : undefined,
      zIndex: config.zIndex,
    }
  }, [])

  return {
    getValidatedConfig,
    updateConfig,
    updateStyles,
  }
}

export function useGridProps(state: PGState) {
  return {
    getGridProps: useCallback(<T extends HTMLAttributes<HTMLElement>>(
      props: T,
    ): GridProps<T> => {
      const gridStyle = {
        ...props.style,
        '--grid-base': `${state.base}px`,
        '--grid-max-width': typeof state.maxWidth === 'number'
          ? `${state.maxWidth}px`
          : state.maxWidth,
        '--grid-z-index': state.zIndex,
      }

      return {
        ...props,
        style: gridStyle,
      } as GridProps<T>
    }, [state.base, state.maxWidth, state.zIndex]),
  }
}
