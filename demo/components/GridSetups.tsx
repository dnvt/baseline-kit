import { useReducer, useLayoutEffect, type PropsWithChildren } from 'react'

import { GRID } from '@utils'
import { PaddedGrid, type PGConfig, XGrid, YGrid } from '@components'
import { type GridColumnsPattern } from '@types'
import { GridControls } from './GridControls'

export interface GridState {
  config: Partial<PGConfig>
  showGuides: {
    columns: boolean
    baseline: boolean
  }
  columnConfig: {
    count: number
    gap: number
    pattern: GridColumnsPattern
  }
  pageHeight: number
}

const WIDTH = '1200px'

const initialState: GridState = {
  config: {
    base: GRID.DEFAULTS.BASE,
    maxWidth: '100%',
    align: 'center',
    zIndex: GRID.DEFAULTS.Z_INDEX,
  },
  showGuides: {
    columns: true,
    baseline: true,
  },
  columnConfig: {
    count: GRID.DEFAULTS.COLUMNS,
    gap: GRID.DEFAULTS.BASE,
    pattern: [
      '24px',
      '24px',
      '64px',
      '1fr',
      '2fr',
      '1fr',
      '64px',
      '24px',
      '24px',
    ] as GridColumnsPattern,
  },
  pageHeight: 0,
}

export type GridAction =
  | { type: 'UPDATE_CONFIG'; payload: Partial<PGConfig> }
  | { type: 'SET_PAGE_HEIGHT'; payload: number }
  | {
  type: 'TOGGLE_GUIDE'
  payload: { type: 'columns' | 'baseline'; value: boolean }
}
  | {
  type: 'UPDATE_COLUMN_CONFIG'
  payload: Partial<GridState['columnConfig']>
}

function gridReducer(state: GridState, action: GridAction): GridState {
  switch (action.type) {
  case 'UPDATE_CONFIG':
    return {
      ...state,
      config: { ...state.config, ...action.payload },
    }
  case 'TOGGLE_GUIDE':
    return {
      ...state,
      showGuides: {
        ...state.showGuides,
        [action.payload.type]: action.payload.value,
      },
    }
  case 'UPDATE_COLUMN_CONFIG':
    return {
      ...state,
      columnConfig: { ...state.columnConfig, ...action.payload },
    }
  case 'SET_PAGE_HEIGHT':
    return {
      ...state,
      pageHeight: action.payload,
    }
  default:
    return state
  }
}

export function GridSetups({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(gridReducer, initialState)

  useLayoutEffect(() => {
    const updatePageHeight = () => {
      const height = document.documentElement.scrollHeight
      if (height !== state.pageHeight) {
        dispatch({ type: 'SET_PAGE_HEIGHT', payload: height })
      }
    }

    updatePageHeight()
    window.addEventListener('resize', updatePageHeight)

    const observer = new MutationObserver(updatePageHeight)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('resize', updatePageHeight)
      observer.disconnect()
    }
  }, [state.pageHeight])

  return (
    <div className="grid-playground">
      <PaddedGrid
        config={{
          ...state.config,
          baseUnit: state.config.base,
        }}
      >
        <YGrid
          config={{
            show: state.showGuides.baseline,
            height: state.pageHeight,
            baseUnit: state.config.base,
          }}
        />
        <div
          className="demo-wrapper"
          style={{ '--max-width': WIDTH }}
        >
          <XGrid
            config={{
              show: state.showGuides.columns,
              maxWidth: WIDTH,
              columns: state.columnConfig.count,
              gap: state.columnConfig.gap,
              baseUnit: state.config.base,
            }}
          />
          <XGrid
            config={{
              show: state.showGuides.columns,
              maxWidth: WIDTH,
              columns: state.columnConfig.pattern,
              gap: 8,
              color: '#0000ff25',
              baseUnit: state.config.base,
            }}
          />
          <XGrid
            config={{
              show: state.showGuides.columns,
              maxWidth: WIDTH,
              variant: 'line',
              gap: 8,
              color: '#00000020',
              baseUnit: state.config.base,
            }}
          />
          <div className="demo-content">

            {children}
          </div>
        </div>
      </PaddedGrid>
      <GridControls state={state} dispatch={dispatch} />
    </div>
  )
}

