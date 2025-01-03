import { useReducer, useCallback, ReactNode } from 'react'
import { XGrid, YGrid } from '@components'
import { type GridColumnsPattern } from '@types'
import { COMPONENTS, X_GRID } from '@config'

import { GridControls } from './GridControls'
import type { DemoGridAction, DemoGridState } from './types'
import { usePageHeight } from '../hooks'

// Custom reducer for the demo -------------------------------------------------

// Handles all grid state changes in one place
// to prevent prop drilling and state conflicts
function demoGridReducer(state: DemoGridState, action: DemoGridAction): DemoGridState {
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

// Init data -------------------------------------------------------------------

const initialState: DemoGridState = {
  config: {
    baseUnit: COMPONENTS.baseUnit,
    zIndex: COMPONENTS.zIndex,
  },
  showGuides: {
    columns: true,
    baseline: true,
  },
  columnConfig: {
    count: X_GRID.columns,
    gap: X_GRID.gap,
    pattern: [
      '24px',
      '24px',
      '48px',
      '128px',
      '1fr',
      '128px',
      '48px',
      '24px',
      '24px',
    ] as GridColumnsPattern,
  },
  pageHeight: 0,
}

// Grid demo setup -------------------------------------------------------------

export function GridSetups({ contentNode }: { contentNode: (showBaseline: boolean) => ReactNode }) {
  const [state, dispatch] = useReducer(demoGridReducer, initialState)

  // Tracks document height changes to adjust grid overlay dynamically
  const handleHeightChange = useCallback((height: number) => {
    if (height !== state.pageHeight) {
      dispatch({ type: 'SET_PAGE_HEIGHT', payload: height })
    }
  }, [state.pageHeight])

  usePageHeight(handleHeightChange)

  return (
    <div className="grid-playground">
      <YGrid
        visibility={state.showGuides.baseline ? 'visible' : 'hidden'}
        config={{ height: state.pageHeight }}
      />
      <div className="demo-wrapper">

        {/*<XGrid visibility={state.showGuides.columns ? 'visible' : 'hidden'} config={{*/}
        {/*  variant: 'pattern',*/}
        {/*  padding: '0 16px',*/}
        {/*  color: 'var(--grid-color-line)',*/}
        {/*  columns: state.columnConfig.pattern,*/}
        {/*  gap: 8,*/}
        {/*  zIndex: state.config.zIndex,*/}
        {/*}} />*/}

        {/*<XGrid visibility={state.showGuides.columns ? 'visible' : 'hidden'} config={{*/}
        {/*  variant: 'auto',*/}
        {/*  columnWidth: 144,*/}
        {/*  color: 'var(--grid-color-line)',*/}
        {/*  gap: 16,*/}
        {/*  zIndex: state.config.zIndex,*/}
        {/*}} />*/}

        <XGrid
          visibility={state.showGuides.columns ? 'visible' : 'hidden'}
          config={{
            variant: 'fixed',
            columns: state.columnConfig.count,
            gap: state.columnConfig.gap,
          }}
        />

        <XGrid
          visibility={state.showGuides.columns ? 'visible' : 'hidden'}
        />
        <div className="demo-content">
          {contentNode(state.showGuides.baseline)}
        </div>
      </div>
      <GridControls state={state} dispatch={dispatch} />
    </div>
  )
}
