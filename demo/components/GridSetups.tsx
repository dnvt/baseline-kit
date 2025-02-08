import { useReducer, useCallback, ReactNode } from 'react'
import { GridControls } from './GridControls'
import type { DemoGridAction, DemoGridState } from './types'
import { usePageHeight } from '../hooks'
import { Guide, DEFAULT_CONFIG, GuideColumnsPattern } from '../../dist'
import { Baseline } from '@/components/Baseline'
import { Config } from '@components'


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

export const DEMO: DemoGridState = {
  config: {
    base: DEFAULT_CONFIG.base,
  },
  showGuides: {
    columns: true,
    baseline: true,
  },
  columnConfig: {
    count: 9,
    gap: 1,
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
    ] as GuideColumnsPattern,
  },
  pageHeight: 0,
}

// Grid demo setup -------------------------------------------------------------

export function GridSetups({ contentNode }: { contentNode: (showBaseline: boolean) => ReactNode }) {
  const [state, dispatch] = useReducer(demoGridReducer, DEMO)

  const handleHeightChange = useCallback((height: number) => {
    if (height !== state.pageHeight) {
      dispatch({ type: 'SET_PAGE_HEIGHT', payload: height })
    }
  }, [state.pageHeight])

  usePageHeight(handleHeightChange)

  return (
    <Config>
      <div className="grid-playground">
        <Baseline debugging={state.showGuides.columns ? 'visible' : 'hidden'} height={state.pageHeight} />

        <div className="demo-wrapper">
          <Guide
            debugging={state.showGuides.columns ? 'visible' : 'hidden'}
            gap={state.columnConfig.gap}
          />
          <Guide
            debugging={state.showGuides.columns ? 'visible' : 'hidden'}
            variant="fixed"
            gap={state.columnConfig.gap}
            columns={9}
          />
          <div className="demo-content">
            {contentNode(state.showGuides.baseline)}
          </div>
        </div>

        <GridControls state={state} dispatch={dispatch} />
      </div>
    </Config>
  )
}
