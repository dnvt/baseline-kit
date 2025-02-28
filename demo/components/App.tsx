import { useReducer, useCallback } from 'react'
import { Config } from '../../dist'
import { Controls } from './Controls'
import { Demo } from './Demo'
import { usePageHeight } from '../hooks'
import { actions, STATE } from '../reducer'
import { Baseline, Guide, Layout } from '@components'

// Grid demo setup -------------------------------------------------------------

export function App() {
  const [state, dispatch] = useReducer(actions, STATE)

  const handleHeightChange = useCallback(
    (height: number) => {
      if (height !== state.pageHeight) {
        dispatch({ type: 'SET_PAGE_HEIGHT', payload: height })
      }
    },
    [state.pageHeight],
  )

  usePageHeight(handleHeightChange)

  return (
    <Config>
      <Baseline
        debugging={state.showGuides.baseline ? 'visible' : 'hidden'}
        height={state.pageHeight}
        style={{ zIndex: 999 }}
      />
      <Layout padding={16} gap={16} width="100%" columns={'320px 1fr'}>
        <Controls state={state} dispatch={dispatch} />
        <Demo state={state} guides={
          <>
            <Guide
              debugging={state.showGuides.guides ? 'visible' : 'hidden'}
              gap={state.columnConfig.gap}
            />
            <Guide
              debugging={state.showGuides.guides ? 'visible' : 'hidden'}
              variant="fixed"
              gap={state.columnConfig.gap}
              columns={9}
            />
          </>
        } />
      </Layout>
    </Config>
  )
}
