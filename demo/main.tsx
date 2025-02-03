import { Fragment, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GridSetups, Indice } from './components'

import '../dist/styles.css'
import { Spacer, Box, Config, Baseline } from '../dist'
import { Layout } from '@components'

export interface ContentProps {
  showBaseline?: boolean;
}

document.body.innerHTML = '<div id="root"></div>'
const root = createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <StrictMode>
    <GridSetups contentNode={(bool) => <Content showBaseline={bool} />} />
  </StrictMode>,
)

function Content({ showBaseline }: ContentProps) {
  const visibility = showBaseline ? 'visible' : 'hidden'

  return (
    <>
      <Layout block={[42, 24]} columns={9} debugging="visible" width="100vw">
        <Box block={[6, 10]} debugging={visibility} colSpan={5}>
          <h1 className="demo-title">Padded Playground</h1>
        </Box>
        <Box block={[6, 10]} debugging="visible" snapping="height" colSpan={5}>
          <p>
            This is a comprehensive demo showcasing the grid system capabilities.
            Use the controls to experiment with different grid configurations.
          </p>
        </Box>
      </Layout>
      {Array.from({ length: 100 }).map((_, i) => {
        return (
          <Fragment key={i}>
            {!!i && <Spacer height={8} debugging={visibility} variant="flat" />}
            <Box debugging={visibility} block={[0, 2]} width="100%">
              <Config base={8}>
                <div className="content-block">
                  <Baseline
                    height={56}
                    debugging={visibility}
                  />
                  Content Block {i + 1}
                </div>
              </Config>
            </Box>
          </Fragment>
        )
      })}

      <Spacer height={40} debugging={visibility} indicatorNode={Indice} />
    </>
  )
}

