import { Fragment, ReactElement, useRef } from 'react'
import { Box, Config, Baseline, Layout, Stack, Spacer } from '@kit'
import { Indice } from './ui/Indice'
import type { DemoGridState } from './types'

export function Demo({
  state,
  guides,
}: {
  state: DemoGridState
  guides: ReactElement
}) {
  const box1 = useRef<HTMLDivElement>(null)
  const box2 = useRef<HTMLDivElement>(null)

  return (
    <Stack className="demo" justify="center" width="100%">
      <Stack width={1216} direction="column">
        {guides}
        <Stack
          gap={12}
          block={8}
          align="flex-start"
          style={{ flexWrap: 'wrap' }}
          debugging={state.showGuides.stack ? 'visible' : 'hidden'}
        >
          {[1, 2, 3, 4].map((num) => (
            <Box
              key={num}
              block={[6, 10]}
              debugging={state.showGuides.box ? 'visible' : 'hidden'}
              width="auto"
              style={{ flexShrink: 0 }}
            >
              <p>Menu {num}</p>
            </Box>
          ))}
        </Stack>

        <Layout
          block={24}
          columns={9}
          columnGap={8}
          debugging={state.showGuides.layout ? 'visible' : 'hidden'}
          indicatorNode={Indice}
        >
          <Box
            ref={box1}
            block={[6, 10]}
            span={5}
            debugging={state.showGuides.box ? 'visible' : 'hidden'}
            snapping="height"
          >
            <h1 className="demo-title">
              This is Baseline Kit library Playground. So let us play with it!
            </h1>
          </Box>
          {/*<Spacer variant="flat" style={{ gridColumn: 'span 4' }} debugging="visible" height={box1Height} />*/}
          <Box
            ref={box2}
            block={[6, 10]}
            snapping="height"
            span={5}
            debugging={state.showGuides.box ? 'visible' : 'hidden'}
          >
            <p>
              This is a comprehensive demo showcasing the grid system
              capabilities. Use the controls to experiment with different grid
              configurations.
            </p>
          </Box>
          {/*<Spacer variant="flat" style={{ gridColumn: 'span 4' }} debugging="visible" height={box2Height} />*/}
        </Layout>

        {Array.from({ length: 100 }).map((_, i) => (
          <Fragment key={i}>
            {!!i && (
              <Spacer
                height={8}
                debugging={state.showGuides.spacer ? 'visible' : 'hidden'}
                variant="flat"
              />
            )}
            <Box
              debugging={state.showGuides.box ? 'visible' : 'hidden'}
              block={[0, 2]}
              width="100%"
            >
              <Config base={8}>
                <div className="block">
                  <Baseline
                    height={56}
                    debugging={state.showGuides.baseline ? 'visible' : 'hidden'}
                  />
                  Content Block {i + 1}
                </div>
              </Config>
            </Box>
          </Fragment>
        ))}

        <Spacer
          height={40}
          debugging={state.showGuides.spacer ? 'visible' : 'hidden'}
          indicatorNode={Indice}
        />
      </Stack>
    </Stack>
  )
}
