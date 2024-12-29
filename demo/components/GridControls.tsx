import type { Dispatch } from 'react'
import type { DemoGridAction, DemoGridState } from './types.ts'
import { usePerformanceMonitor } from '../utils'

export function GridControls({
  state,
  dispatch,
}: {
  state: DemoGridState
  dispatch: Dispatch<DemoGridAction>
}) {
  const metrics = usePerformanceMonitor()

  return (
    <div className="grid-controls">
      <div className="controls-spacing">
        {/* Performance Metrics Section */}
        <div>
          <h3>Performance</h3>
          <div>
            <pre>{JSON.stringify(metrics, null, 2)}</pre>
          </div>
        </div>

        {/* Grid Guides Section */}
        <div>
          <h3>Grid Guides</h3>
          <div className="checkbox-container">
            {/* Toggle Columns Guide */}
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={state.showGuides.columns}
                onChange={(e) =>
                  dispatch({
                    type: 'TOGGLE_GUIDE',
                    payload: { type: 'columns', value: e.target.checked },
                  })
                }
              />
              Columns
            </label>

            {/* Toggle Baseline Guide */}
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={state.showGuides.baseline}
                onChange={(e) =>
                  dispatch({
                    type: 'TOGGLE_GUIDE',
                    payload: { type: 'baseline', value: e.target.checked },
                  })
                }
              />
              Baseline
            </label>
          </div>

        </div>

        {/* Grid Configuration Section */}
        <div>
          <h3>Grid Configuration</h3>

          {/* Adjust Z-Index */}
          <label className="z-index-label">
            <span className="z-index-text">Z-Index</span>
            <input
              type="range"
              className="z-index-range"
              min="-1"
              max="10"
              value={state.config.zIndex}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_CONFIG',
                  payload: { zIndex: Number(e.target.value) },
                })
              }
            />
            <span className="z-index-value">{state.config.zIndex}</span>
          </label>

          {/* Adjust Base Unit */}
          <label className="base-unit-label">
            <span className="base-unit-text">Base Unit</span>
            <input
              type="range"
              className="base-unit-range"
              min="4"
              max="16"
              value={state.config.baseUnit}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_CONFIG',
                  payload: { baseUnit: Number(e.target.value) },
                })
              }
            />
            <span className="base-unit-value">{state.config.baseUnit}px</span>
          </label>
        </div>

        {/* Column Configuration Section */}
        <div>
          <h3>Column Configuration</h3>

          {/* Adjust Column Count */}
          <label className="base-unit-label">
            <span className="base-unit-text">Column Count</span>
            <input
              type="range"
              className="base-unit-range"
              min="2"
              max="24"
              value={state.columnConfig.count}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_COLUMN_CONFIG',
                  payload: { count: Number(e.target.value) },
                })
              }
            />
            <span className="base-unit-value">
              {state.columnConfig.count} columns
            </span>
          </label>

          {/* Adjust Column Gap */}
          <label className="base-unit-label">
            <span className="base-unit-text">Column Gap</span>
            <input
              type="range"
              className="base-unit-range"
              min="0"
              max="48"
              value={state.columnConfig.gap}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_COLUMN_CONFIG',
                  payload: { gap: Number(e.target.value) },
                })
              }
            />
            <span className="base-unit-value">{state.columnConfig.gap}px</span>
          </label>
        </div>
      </div>
    </div>
  )
}
