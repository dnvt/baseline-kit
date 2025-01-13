import { Fragment, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Spacer, YGrid, Box } from '@components'

import { GridSetups, Indice } from './components'


export interface ContentProps {
  showBaseline?: boolean;
}

document.body.innerHTML = '<div id="root"></div>'
const root = createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <StrictMode>
    <GridSetups contentNode={(bool) => <Content showBaseline={bool} />}>
    </GridSetups>
  </StrictMode>,
)

function Content({ showBaseline }: ContentProps) {
  const visibility = showBaseline ? 'visible' : 'hidden'

  return (
    <>
      <Spacer height={42} visibility={visibility} indicatorNode={Indice} />
      <Box block={[2, 4]} visibility={visibility} style={{ gridColumn: '1 / span 4' }}>
        <h1 className="demo-title">Padded Playground</h1>
      </Box>
      <Box block={[6, 10]} visibility="visible" style={{ gridColumn: '1 / span 4' }}>
        <p>
          This is a comprehensive demo showcasing the grid system capabilities.
          Use the controls to experiment with different grid configurations.
        </p>
      </Box>

      <Spacer height={24} visibility={visibility} indicatorNode={Indice} />

      {Array.from({ length: 50 }).map((_, i) => {
        return (
          <Fragment key={i}>
            {!!i && <Spacer height={8} visibility={visibility} />}
            <Box visibility={visibility} block={[0, 2]} width={'100%'}>
              <div className="content-block">
                <YGrid visibility={visibility} />
                Content Block {i + 1}
              </div>
            </Box>
          </Fragment>
        )
      })}

      <Spacer height={40} visibility={visibility} indicatorNode={Indice} />
    </>
  )
}

