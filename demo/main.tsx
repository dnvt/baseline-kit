import { Fragment, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GridSetups, Indice } from './components'

import { Spacer, Box, Config, Baseline, Layout, Stack } from '../dist'
import '../dist/styles.css'

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
      <Stack gap={12} debugging="visible">
        <Box block={[6, 10]} debugging="visible"><p>Menu 1</p></Box>
        <Box block={[6, 10]} debugging="visible"><p>Menu 2</p></Box>
        <Box block={[6, 10]} debugging="visible"><p>Menu 3</p></Box>
        <Box block={[6, 10]} debugging="visible"><p>Menu 4</p></Box>
      </Stack>
      <Spacer height={24} debugging="visible" indicatorNode={Indice} />
      <Layout
        block={[0, 24]}
        columns={9}
        columnGap={8}
        debugging="visible"
        indicatorNode={Indice}
      >
        <Box block={[6, 10]} span={5} debugging={'visible'}>
          <h1 className="demo-title">This is Baseline Kit library Playground. So let us play with it!</h1>
        </Box>
        <Box block={[6, 10]} snapping="height" span={5} debugging={'visible'}>
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
            <Box debugging={'visible'} block={[0, 2]} width="100%">
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

