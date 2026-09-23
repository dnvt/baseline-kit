import {
  Baseline,
  Box,
  Config,
  Guide,
  Padder,
  Spacer,
} from '@baseline-kit/react'
import { Fragment, useState, type CSSProperties } from 'react'

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

function StatefulPadderProbe() {
  const [domDiagnostics, setDomDiagnostics] = useState(true)
  const [clicks, setClicks] = useState(0)

  return (
    <Config domDiagnostics={domDiagnostics}>
      <section id="padder-diagnostics-transition">
        <Padder id="padder-diagnostics-host" debugging="visible" ssrMode>
          <button
            id="padder-diagnostics-child"
            onClick={() => setClicks((value) => value + 1)}
          >
            Clicks {clicks}
          </button>
        </Padder>
        <button
          id="padder-diagnostics-toggle"
          onClick={() => setDomDiagnostics((value) => !value)}
        >
          Toggle diagnostics
        </button>
      </section>
    </Config>
  )
}

function StatefulBoxChild() {
  const [clicks, setClicks] = useState(0)

  return (
    <button
      id="box-snap-stateful-child"
      onClick={() => setClicks((value) => value + 1)}
    >
      Box clicks {clicks}
    </button>
  )
}

function StatefulSnappingBoxProbe() {
  const [expanded, setExpanded] = useState(false)

  return (
    <section id="box-snap-state-transition">
      <Box id="box-snap-stateful-host" snapping="clamp">
        <div style={{ height: expanded ? 20 : 10 }}>
          <StatefulBoxChild />
        </div>
      </Box>
      <button id="box-snap-expand-content" onClick={() => setExpanded(true)}>
        Expand content
      </button>
    </section>
  )
}

function StatefulBoxDiagnosticsProbe() {
  const [domDiagnostics, setDomDiagnostics] = useState(true)
  const [clicks, setClicks] = useState(0)

  return (
    <section id="box-diagnostics-transition">
      <Config domDiagnostics={domDiagnostics}>
        <Box id="box-diagnostics-host" snapping="none">
          <button
            id="box-diagnostics-child"
            onClick={() => setClicks((value) => value + 1)}
          >
            Box clicks {clicks}
          </button>
        </Box>
      </Config>
      <button
        id="box-diagnostics-toggle"
        onClick={() => setDomDiagnostics((value) => !value)}
      >
        Toggle Box diagnostics
      </button>
    </section>
  )
}

export function App() {
  const content = (
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

      <StatefulPadderProbe />
      <StatefulSnappingBoxProbe />
      <StatefulBoxDiagnosticsProbe />

      <section id="guide-paint-parity">
        <div
          id="guide-paint-reference"
          style={{ position: 'relative', width: 320, height: 32 }}
        >
          <Config domDiagnostics>
            <Guide
              id="guide-paint-reference-host"
              variant="fixed"
              columns={4}
              debugging="visible"
            />
          </Config>
        </div>
        <Config domDiagnostics={false}>
          <div
            id="guide-paint-compact"
            style={{ position: 'relative', width: 320, height: 32 }}
          >
            <Guide
              id="guide-paint-compact-host"
              variant="fixed"
              columns={4}
              debugging="visible"
            />
          </div>
        </Config>
      </section>

      <Config domDiagnostics={false}>
        <section id="zero-padding-components">
          <Box id="zero-padding-box" debugging="hidden" ssrMode>
            <span id="zero-padding-box-child">Box child</span>
          </Box>
          <Padder id="zero-padding-padder" debugging="visible" ssrMode>
            <span id="zero-padding-padder-child">Padder child</span>
          </Padder>
          <Padder
            id="right-only-padder"
            padding={{ right: 24 }}
            debugging="hidden"
            ssrMode
          >
            <div id="right-only-content" style={{ width: 100, height: 20 }} />
          </Padder>
          <Padder
            id="bottom-only-padder"
            padding={{ bottom: 24 }}
            debugging="hidden"
            ssrMode
          >
            <div id="bottom-only-content" style={{ width: 100, height: 20 }} />
          </Padder>
        </section>
      </Config>

      <section id="box-caller-layout">
        <Box
          id="caller-layout-box"
          style={{ display: 'flex' }}
          block={8}
          debugging="visible"
          snapping="none"
        >
          <span id="caller-layout-box-child">Caller layout</span>
        </Box>
        <Box
          id="box-inline-size-fallback"
          style={{ width: '100%', height: 32 }}
          block={8}
          debugging="visible"
          snapping="none"
        >
          <span>Caller-sized Box</span>
        </Box>
      </section>

      <Config domDiagnostics>
        <Box
          id="box-visible-debug-fallback"
          debugging="visible"
          snapping="none"
          block={[8, 8]}
          inline={[16, 16]}
        >
          <span>Visible debug fallback</span>
        </Box>
      </Config>

      <Config domDiagnostics={false}>
        <section id="box-merge-paint-parity">
          <div
            id="box-merge-reference"
            style={{ position: 'relative', width: 320, height: 32 }}
          >
            <Box
              id="box-merge-reference-host"
              style={{ display: 'grid' }}
              height="100%"
              block={[8, 8]}
              inline={[16, 16]}
              debugging="hidden"
              snapping="none"
            >
              <div
                id="box-merge-reference-child"
                style={{ width: 40, height: 16, backgroundColor: '#123456' }}
              />
            </Box>
          </div>
          <div
            id="box-merge-candidate"
            style={{ position: 'relative', width: 320, height: 32 }}
          >
            <Box
              id="box-merge-candidate-host"
              height="100%"
              block={[8, 8]}
              inline={[16, 16]}
              debugging="hidden"
              snapping="none"
            >
              <div
                id="box-merge-candidate-child"
                style={{ width: 40, height: 16, backgroundColor: '#123456' }}
              />
            </Box>
          </div>
        </section>
      </Config>

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

      <section id="baseline-paint-parity">
        {[
          { name: 'line', base: 8, variant: 'line' as const, color: undefined },
          {
            name: 'flat',
            base: 8,
            variant: 'flat' as const,
            color: '#283c50',
          },
          {
            name: 'fractional',
            base: 4.5,
            variant: 'line' as const,
            color: '#123456',
          },
        ].map(({ name, base, variant, color }) => (
          <Fragment key={name}>
            <div
              id={`baseline-reference-${name}`}
              style={{ position: 'relative', width: 320, height: 32 }}
            >
              <Baseline
                id={`baseline-reference-host-${name}`}
                debugging="visible"
                base={base}
                variant={variant}
                color={color}
                width="100%"
                height="100%"
              />
            </div>
            <Config domDiagnostics={false}>
              <div
                id={`baseline-compact-${name}`}
                style={{ position: 'relative', width: 320, height: 32 }}
              >
                <Baseline
                  id={`baseline-compact-host-${name}`}
                  debugging="visible"
                  base={base}
                  variant={variant}
                  color={color}
                  width="100%"
                  height="100%"
                />
              </div>
            </Config>
          </Fragment>
        ))}
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
            padder={{ debugging: 'visible', color: '#707070' }}
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
  return <Config domDiagnostics>{content}</Config>
}
