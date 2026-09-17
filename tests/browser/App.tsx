import {
  Baseline,
  Box,
  Config,
  Guide,
  Padder,
  Spacer,
} from '@baseline-kit/react'
import type { CSSProperties } from 'react'

const dimensionCases = [
  { id: 'width-omitted', axis: 'width', value: undefined },
  { id: 'width-half', axis: 'width', value: '50%' },
  { id: 'width-viewport', axis: 'width', value: '100vw' },
  { id: 'width-calc', axis: 'width', value: 'calc(100% - 24px)' },
  { id: 'width-pixels', axis: 'width', value: 160 },
  { id: 'width-zero', axis: 'width', value: 0 },
  { id: 'height-omitted', axis: 'height', value: undefined },
  { id: 'height-half', axis: 'height', value: '50%' },
  { id: 'height-full', axis: 'height', value: '100%' },
  { id: 'height-vh', axis: 'height', value: '100vh' },
  { id: 'height-vw', axis: 'height', value: '100vw' },
  { id: 'height-dvh', axis: 'height', value: '100dvh' },
  { id: 'height-rem', axis: 'height', value: '10rem' },
  { id: 'height-em', axis: 'height', value: '10em' },
  { id: 'height-calc', axis: 'height', value: 'calc(100% - 24px)' },
  { id: 'height-pixels', axis: 'height', value: 160 },
  { id: 'height-zero', axis: 'height', value: 0 },
] as const

export function App() {
  return (
    <main>
      <p id="ssr-content">Server-rendered content remains available.</p>
      <section
        id="guide-viewport"
        style={{ position: 'relative', width: 320, height: 160 }}
      >
        <Guide debugging="visible" width="100vw" height="100vh" />
      </section>
      <section id="padder-snap">
        <Padder debugging="none">
          <div style={{ width: 20, height: 10 }} />
        </Padder>
      </section>

      <section id="box-snap-top">
        <Box
          snapping="height"
          snapEdge="top"
          debugging="visible"
          block={[0, 0]}
        >
          <div style={{ width: 20, height: 10 }}>React top snap consumer</div>
        </Box>
      </section>

      <section
        id="baseline-percent"
        style={{ position: 'relative', width: 320, height: 160 }}
      >
        <Baseline debugging="visible" base={8} width="100%" height="100%" />
      </section>

      <section
        id="baseline-default-paint"
        style={{ position: 'relative', width: 320, height: 16 }}
      >
        <Baseline debugging="visible" base={8} width="100%" height={16} />
      </section>

      <section
        id="baseline-viewport"
        style={{ position: 'relative', width: 320, height: 160 }}
      >
        <Baseline debugging="visible" base={8} width="100%" height="100vh" />
      </section>

      <section
        id="baseline-parent-resize"
        style={{ position: 'relative', width: 320, height: 160 }}
      >
        <Baseline debugging="visible" base={8} width="100%" height="100%" />
      </section>

      <section
        id="baseline-virtual-tall"
        style={{ position: 'relative', width: 320, height: 8000 }}
      >
        <Baseline debugging="visible" base={8} width="100%" height={8000} />
      </section>

      <section id="react-dimension-matrix" style={{ fontSize: 16 }}>
        {dimensionCases.map(({ id, axis, value }) => (
          <div
            id={`react-dimension-${id}`}
            key={id}
            style={{ position: 'relative', width: 400, height: 240 }}
          >
            <Baseline
              debugging="visible"
              base={8}
              width={axis === 'width' ? value : '100%'}
              height={axis === 'height' ? value : 40}
            />
          </div>
        ))}
      </section>

      <section id="config-consumers">
        <div id="config-box">
          <Config
            box={{
              debugging: 'visible',
              colors: {
                line: '#ff0000',
                flat: '#00ff00',
                text: '#0000ff',
              },
            }}
          >
            <Box>Box consumer</Box>
          </Config>
        </div>

        <div id="config-spacer">
          <Config
            spacer={{
              debugging: 'visible',
              colors: {
                line: '#ff0000',
                flat: '#00ff00',
                text: '#0000ff',
              },
            }}
          >
            <Spacer height={16} variant="flat" />
          </Config>
        </div>

        <div id="config-baseline" style={{ position: 'relative', height: 16 }}>
          <Config
            baseline={{
              debugging: 'visible',
              colors: { line: '#101010', flat: '#202020' },
            }}
          >
            <Baseline debugging="visible" base={8} width="100%" height={16} />
          </Config>
        </div>

        <div
          id="config-baseline-inline"
          style={{ position: 'relative', height: 16 }}
        >
          <Config
            baseline={{
              debugging: 'visible',
              colors: { line: '#101010', flat: '#202020' },
            }}
          >
            <Baseline
              debugging="visible"
              base={8}
              width="100%"
              height={16}
              style={{ '--bkbl-cl': 'rgb(1, 2, 3)' } as CSSProperties}
            />
          </Config>
        </div>

        <div
          id="config-guide"
          style={{ position: 'relative', width: 320, height: 160 }}
        >
          <Config
            guide={{
              debugging: 'visible',
              variant: 'fixed',
              colors: {
                line: '#303030',
                pattern: '#404040',
                auto: '#505050',
                fixed: '#606060',
              },
            }}
          >
            <Guide variant="fixed" columns={4} debugging="visible" />
          </Config>
        </div>

        <div
          id="config-guide-inline"
          style={{ position: 'relative', width: 320, height: 160 }}
        >
          <Config
            guide={{
              debugging: 'visible',
              variant: 'fixed',
              colors: {
                line: '#303030',
                pattern: '#404040',
                auto: '#505050',
                fixed: '#606060',
              },
            }}
          >
            <Guide
              variant="fixed"
              columns={4}
              debugging="visible"
              style={{ '--bkgd-cf': 'rgb(1, 2, 3)' } as CSSProperties}
            />
          </Config>
        </div>

        <div id="config-padder">
          <Config padder={{ debugging: 'visible', color: '#707070' }}>
            <Padder debugging="visible" block={[8, 8]}>
              Padder consumer
            </Padder>
          </Config>
        </div>
      </section>
    </main>
  )
}
