import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { YGrid } from '@components'

import { GridSetups } from './components'

export interface ContentProps {
  showBaseline?: boolean;
}

document.body.innerHTML = '<div id="root"></div>'
const root = createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <StrictMode>
    <GridSetups>
      <Content />
    </GridSetups>
  </StrictMode>,
)

function Content({ showBaseline }: ContentProps) {
  return (
    <>
      <div style={{ height: 40 }} />
      <h1 className="demo-title">Grid Playground</h1>
      <p className="demo-description">
        This is a comprehensive demo showcasing the grid system capabilities.
        Use the controls to experiment with different grid configurations.
      </p>

      {Array.from({ length: 100 }).map((_, i) => (
        <div key={i} className="content-block">
          <YGrid
            visibility={showBaseline ? 'visible' : 'hidden'}
            config={{ color: 'var(--grid-color-pattern)', variant: 'flat' }}
          />
          Content Block {i + 1}
        </div>
      ))}
      <div style={{ height: 40 }} />
    </>
  )
}

