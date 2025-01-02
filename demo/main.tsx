import { Fragment, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Spacer, YGrid } from '@components'

import { GridSetups, Indice } from './components'

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

function Content({
  showBaseline,
}: ContentProps,
) {
  const visibility = showBaseline ? 'visible' : 'hidden'

  return (
    <>
      <Spacer height={42} visibility={visibility} indicatorNode={Indice} />
      <h1 className="demo-title">Padded Playground</h1>
      <Spacer height={8} visibility={visibility} />
      <p className="demo-description">
        This is a comprehensive demo showcasing the grid system capabilities.
        Use the controls to experiment with different grid configurations.
      </p>
      <Spacer height={16} visibility={visibility} />

      {Array.from({ length: 50 }).map((_, i) => (
        <Fragment key={i}>
          {!!i && <Spacer height={8} visibility={visibility} config={{ variant: 'flat' }} />}
          <div className="content-block">
            <YGrid visibility={visibility} config={{ height: '100%' }} />
            Content Block {i + 1}
          </div>
        </Fragment>
      ))}
      <Spacer height={40} visibility={visibility} indicatorNode={Indice} />
    </>
  )
}

