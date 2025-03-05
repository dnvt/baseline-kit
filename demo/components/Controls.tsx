import { Dispatch, useId } from 'react'
import { DEFAULT_CONFIG, Stack } from '@kit'
import type { DemoGridAction, DemoGridState } from './types'
import { usePerformanceMonitor, type PerformanceMetrics } from '../hooks'

type GridControlsProps = {
  state: DemoGridState
  dispatch: Dispatch<DemoGridAction>
}

const GuideControls = ({ state, dispatch }: GridControlsProps) => {
  const controls = [
    { key: 'baseline', label: 'Baseline' },
    { key: 'guides', label: 'Guides' },
    { key: 'spacer', label: 'Spacer' },
    { key: 'box', label: 'Box' },
    { key: 'stack', label: 'Stack' },
    { key: 'layout', label: 'Layout' },
  ] as const

  return (
    <section className="visibility-section">
      <h4>Component Visibility</h4>
      <div className="checkbox-container">
        {controls.map(({ key, label }) => (
          <label key={key} className="toggle-label">
            <input
              type="checkbox"
              checked={state.showGuides[key]}
              onChange={(e) =>
                dispatch({
                  type: 'TOGGLE_GUIDE',
                  payload: { component: key, value: e.target.checked },
                })
              }
            />
            {label}
          </label>
        ))}
      </div>
    </section>
  )
}

const RangeControl = ({
  label,
  value,
  suffix = '',
  min,
  max,
  onChange,
  ariaDescription,
}: {
  label: string
  value: number
  suffix?: string
  min: number
  max: number
  onChange: (value: number) => void
  ariaDescription?: string
}) => {
  const id = useId()
  const labelId = `${id}-label`
  const descriptionId = `${id}-description`

  return (
    <div className="range-control">
      <div className="range-header">
        <label id={labelId} htmlFor={id} className="range-label">
          {label}
        </label>
        <span className="range-value" aria-live="polite">
          {value}
          {suffix}
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="range-input"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-labelledby={labelId}
        aria-describedby={ariaDescription ? descriptionId : undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value}${suffix}`}
      />
      {ariaDescription && (
        <div id={descriptionId} className="sr-only">
          {ariaDescription}
        </div>
      )}
    </div>
  )
}

// Usage in ConfigControls:
const ConfigControls = ({ state, dispatch }: GridControlsProps) => (
  <section className="controls-section">
    <h4>Grid Configuration</h4>
    <RangeControl
      label="Base Unit"
      value={state.config.base ?? DEFAULT_CONFIG.base}
      suffix="px"
      min={4}
      max={16}
      ariaDescription="Adjust the base unit size for the grid system"
      onChange={(value) =>
        dispatch({
          type: 'UPDATE_CONFIG',
          payload: { base: value },
        })
      }
    />
    <RangeControl
      label="Column Count"
      value={state.columnConfig.count}
      suffix=" columns"
      min={2}
      max={24}
      ariaDescription="Adjust the number of columns in the grid"
      onChange={(value) =>
        dispatch({
          type: 'UPDATE_COLUMN_CONFIG',
          payload: { count: value },
        })
      }
    />
    <RangeControl
      label="Column Gap"
      value={state.columnConfig.gap}
      suffix="px"
      min={0}
      max={48}
      ariaDescription="Adjust the space between grid columns"
      onChange={(value) =>
        dispatch({
          type: 'UPDATE_COLUMN_CONFIG',
          payload: { gap: value },
        })
      }
    />
  </section>
)

const PerformanceMetrics = ({ metrics }: { metrics: PerformanceMetrics }) => (
  <section className="controls-section">
    <h4>Performance</h4>
    <div className="metrics-container">
      <pre>{JSON.stringify(metrics, null, 2)}</pre>
    </div>
  </section>
)

export function Controls({ state, dispatch }: GridControlsProps) {
//  const metrics = usePerformanceMonitor()

  return (
    <Stack className="controls" direction="column">
      <GuideControls state={state} dispatch={dispatch} />
      <div className="divider" />
      <ConfigControls state={state} dispatch={dispatch} />
      <div className="divider" />
      {/*<PerformanceMetrics metrics={metrics} />*/}
    </Stack>
  )
}
