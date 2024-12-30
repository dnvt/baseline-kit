import { Fragment, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Spacer, YGrid } from '@components'

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
  const visibility = showBaseline ? 'visible' : 'hidden'

  return (
    <>
      <Spacer height={40} visibility={visibility} />
      <h1 className="demo-title">Grid Playground</h1>
      <Spacer height={8} visibility={visibility} />
      <p className="demo-description">
        This is a comprehensive demo showcasing the grid system capabilities.
        Use the controls to experiment with different grid configurations.
      </p>
      <Spacer height={16} visibility={visibility} />

      {Array.from({ length: 100 }).map((_, i) => (
        <Fragment key={i}>
          {!!i && <Spacer height={8} visibility={visibility} />}
          <div className="content-block">
            <YGrid
              config={{ color: 'var(--grid-color-pattern)' }}
              visibility={visibility}
            />
            Content Block {i + 1}
          </div>
        </Fragment>
      ))}
      <Spacer height={40} />
    </>
  )
}

