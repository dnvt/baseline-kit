import { useReducer, type PropsWithChildren, useCallback, Children, isValidElement, cloneElement } from 'react'
import { XGrid, YGrid } from '@components'
import { CSSCustomProperties, type GridColumnsPattern } from '@types'
import { GRID } from '@config'

import { GridControls } from './GridControls'
import type { DemoGridAction, DemoGridState } from './types'
import type { ContentProps } from '../main'
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

const DEMO_WIDTH = '1216px'

const initialState: DemoGridState = {
  config: {
    baseUnit: GRID.defaults.baseUnit,
    zIndex: GRID.defaults.zIndex,
  },
  showGuides: {
    columns: true,
    baseline: true,
  },
  columnConfig: {
    count: GRID.defaults.columns,
    gap: GRID.defaults.baseUnit,
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

export function GridSetups({ children }: PropsWithChildren) {
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
        config={{
          height: state.pageHeight,
          baseUnit: state.config.baseUnit,
          zIndex: state.config.zIndex,
        }}
      />
      <div
        className="demo-wrapper"
        style={{ '--max-width': DEMO_WIDTH } as CSSCustomProperties}
      >
        <XGrid
          visibility={state.showGuides.columns ? 'visible' : 'hidden'}
          data-testid="main-grid"
          config={{
            columns: state.columnConfig.count,
            gap: state.columnConfig.gap,
            zIndex: state.config.zIndex,
          }}
        />

        {/* Pattern */}

        {/*<XGrid*/}
        {/*  visibility={state.showGuides.columns ? 'visible' : 'hidden'}*/}
        {/*  config={{*/}
        {/*    padding: '0 16px',*/}
        {/*    color: 'var(--grid-color-line)',*/}
        {/*    columns: state.columnConfig.pattern,*/}
        {/*    gap: 8,*/}
        {/*    zIndex: state.config.zIndex,*/}
        {/*  }}*/}
        {/*/>*/}

        <XGrid
          visibility={state.showGuides.columns ? 'visible' : 'hidden'}
          data-testid="line-grid"
          config={{
            color: 'var(--grid-color-line)',
            variant: 'line',
            zIndex: state.config.zIndex,
          }}
        />
        <div className="demo-content">
          {Children.map(children, (child) => {
            if (isValidElement<PropsWithChildren<ContentProps>>(child)) {
              return cloneElement(child, {
                showBaseline: state.showGuides.baseline,
              })
            }
            return child
          })}
        </div>
      </div>
      <GridControls state={state} dispatch={dispatch} />
    </div>
  )
}

