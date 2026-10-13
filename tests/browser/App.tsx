import {
  Baseline,
  Box,
  Config,
  Guide,
  Padder,
  Spacer,
} from '@baseline-kit/react'
import { COST_BOX_COUNT, COST_CSS, COST_WORDS, costBox } from './cost-grid'
import {
  SPACER_CH_PROBE,
  SPACER_HEIGHTS,
  SPACER_IN_PARENT,
  SPACER_PARENT,
  SPACER_ROW,
  SPACER_SECTION,
} from './spacer-strings'
import {
  REM_GRID_BOXES,
  REM_GRID_CSS,
  REM_GRID_MARK,
  REM_GRID_SECTION,
  REM_GRID_WORDS,
  remGridText,
} from './rem-grid'
import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'

const LIVE_TEXTS = [
  'Sphinx of black quartz, judge my vow.',
  'The five boxing wizards jump quickly over the lazy dog at dawn.',
  'Pack my box with five dozen liquor jugs, then stack them on the grid line by line.',
  'How vexingly quick daft zebras jump.',
  'A wizard’s job is to vex chumps quickly in fog while the baseline keeps every line in step with the page.',
]

const liveText = (
  font: { size: number; family: string },
  index: number
): CSSProperties => ({
  display: 'block',
  fontFamily: font.family,
  fontSize: `${font.size + (index % 5) * 0.125}rem`,
  lineHeight: 1.3,
})

/** Each DOM variant of a Box: own grid, inner Padder, Padder without spacers, semantic. */
const LIVE_VARIANTS = [
  {},
  { className: 'live-c' },
  { className: 'live-c', debugging: 'none' as const },
  { as: 'h3' as const },
]

/**
 * Live-grid hosts, rendered on the client with `?live`, tagged by
 * `data-live`: content-driven Boxes and Padders in every DOM variant (`box`), a host around another (`nested`),
 * Boxes under CSS zoom (`zoom`), a fixed-height Box (`fixed`), Boxes with a
 * height floor (`floor`), Boxes with a padding transition (`transition`), and
 * a Box whose content toggles next to a twin (`toggle`, `toggle-twin`). Text
 * sizes are in rem, so a root font size change, a font prop change, or a
 * width change re-flows them. `?liveWidth=` sets the starting width.
 */
function LiveGridFixture() {
  const [on, setOn] = useState(false)
  const [width, setWidth] = useState(360)
  const [font, setFont] = useState({ size: 1, family: 'serif' })
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (!params.has('live')) return
    setWidth(Number(params.get('liveWidth') ?? 360))
    setOn(true)
    ;(
      window as unknown as {
        __setLiveFont: (next: { size?: number; family?: string }) => void
      }
    ).__setLiveFont = (next) => setFont((current) => ({ ...current, ...next }))
  }, [])
  if (!on) return null
  const text = (index: number, content = LIVE_TEXTS[index % 5]) => (
    <span style={liveText(font, index)}>{content}</span>
  )
  return (
    <section id="live-grid" style={{ width }}>
      <style>{`.live-transition .bk-box, .live-transition .bk-box * { transition: all 120ms linear; }`}</style>
      {Array.from({ length: 50 }, (_, index) => (
        <Box
          key={index}
          data-live="box"
          snapping={Math.floor(index / 4) % 2 ? 'height' : 'clamp'}
          block={[0, 0]}
          {...LIVE_VARIANTS[index % 4]}
        >
          {text(index)}
        </Box>
      ))}
      <Padder data-live="box" block={[0, 0]}>
        {text(3)}
      </Padder>
      <Padder data-live="box" debugging="none" block={[0, 0]}>
        {text(4)}
      </Padder>
      {/* A snapping host around another: it re-snaps after the inner one. */}
      <Padder data-live="nested" debugging="none" block={[0, 0]}>
        <Box data-live="box" block={[0, 0]}>
          {text(2)}
        </Box>
      </Padder>
      <div style={{ zoom: 1.25 }}>
        {LIVE_VARIANTS.map((variant, index) => (
          <Box key={index} data-live="zoom" block={[0, 0]} {...variant}>
            {text(index)}
          </Box>
        ))}
      </div>
      <Box data-live="fixed" height={100} snapping="height" block={[0, 0]}>
        {text(4)}
      </Box>
      {/* Hosts whose height has a floor: min-height, and a flex fill. */}
      {['99px', '101px', '6.3rem'].map((minHeight, index) => (
        <Box
          key={minHeight}
          data-live="floor"
          style={{ minHeight }}
          snapping={index % 2 ? 'height' : 'clamp'}
          block={[0, 0]}
        >
          {text(index)}
        </Box>
      ))}
      {/* 96px of content under a 99px floor: padding moves it 99 -> 101. */}
      <Box
        data-live="floor"
        data-live-exact
        style={{ minHeight: 99 }}
        block={[0, 0]}
      >
        <div style={{ height: 96 }} />
      </Box>
      <div style={{ display: 'flex', flexDirection: 'column', height: 203 }}>
        <Box data-live="box" block={[0, 0]}>
          {text(1, LIVE_TEXTS[0])}
        </Box>
        <Box data-live="floor" style={{ flex: 1 }} block={[0, 0]}>
          {text(2, LIVE_TEXTS[3])}
        </Box>
      </div>
      {/* Boxes whose padding a CSS transition animates. */}
      <div className="live-transition">
        {LIVE_VARIANTS.map((variant, index) => (
          <Box
            key={index}
            data-live="transition"
            snapping={index % 2 ? 'height' : 'clamp'}
            block={[0, 0]}
            {...variant}
          >
            {text(index, LIVE_TEXTS[index + 1])}
          </Box>
        ))}
      </div>
      {/* Padding drawn as CSS padding, animating to zero. */}
      <div className="live-transition">
        <Box
          data-live="transition-zero"
          className="live-c"
          debugging="none"
          block={[0, 0]}
        >
          <div data-live-zero style={{ height: 13, transition: 'none' }} />
        </Box>
      </div>
      <Box data-live="toggle-twin" block={[0, 0]}>
        <div style={{ height: 10 }} />
      </Box>
      <Box data-live="toggle" block={[0, 0]}>
        <div data-live-toggle style={{ height: 10 }} />
      </Box>
    </section>
  )
}

/** The `?remgrid` hosts (see rem-grid.ts), rendered on the server too. */
function RemGridFixture({ base }: { base: number | `${number}rem` }) {
  return (
    <section
      data-rem-grid={typeof base === 'number' ? 'px' : 'rem'}
      style={REM_GRID_SECTION}
    >
      <style>{REM_GRID_CSS}</style>
      <Config base={base}>
        {REM_GRID_BOXES.map((box, index) => (
          <Box
            key={index}
            data-rem="box"
            block={[0, 0]}
            snapping={box.snapping}
            {...box.variant}
          >
            <span style={remGridText(box.size)}>
              {REM_GRID_WORDS.map((word, wordIndex) => (
                <Fragment key={wordIndex}>
                  {`${word} `}
                  <span data-rem-mark style={REM_GRID_MARK} />
                </Fragment>
              ))}
            </span>
            <span style={{ display: 'block', height: box.trailer }} />
          </Box>
        ))}
        {/* Rounds 20px to the base: 24px at 8px, 20px at 10px. */}
        <Spacer data-rem="spacer" height={20} />
      </Config>
    </section>
  )
}

/** The `?cost=rem|px` hosts (see cost-grid.ts). */
function CostFixture({ kind }: { kind: 'rem' | 'px' }) {
  return (
    <section data-cost-grid={kind} style={REM_GRID_SECTION}>
      <style>{COST_CSS}</style>
      <Config base={kind === 'rem' ? '0.5rem' : 8}>
        {Array.from({ length: COST_BOX_COUNT }, (_, index) => {
          const box = costBox(index)
          return (
            <Box
              key={index}
              data-cost="box"
              block={[0, 0]}
              snapping={box.snapping}
              {...box.variant}
            >
              <span style={remGridText(box.size)}>
                {COST_WORDS.map((word, wordIndex) => (
                  <Fragment key={wordIndex}>
                    {`${word} `}
                    <span style={REM_GRID_MARK} />
                  </Fragment>
                ))}
              </span>
              <span style={{ display: 'block', height: box.trailer }} />
            </Box>
          )
        })}
        <Box data-cost="px-content" block={[0, 0]}>
          <div style={{ height: 45 }} />
        </Box>
      </Config>
    </section>
  )
}

/** The `?spacers` hosts (see spacer-strings.ts). */
function SpacerStringsFixture() {
  return (
    <>
      <section data-spacer-grid="px" style={SPACER_SECTION}>
        <Config base={8}>
          {SPACER_HEIGHTS.map(({ id, height }) => (
            <Spacer key={id} data-spacer={id} height={height} />
          ))}
          {SPACER_IN_PARENT.map(({ id, height }) => (
            <div key={id} style={SPACER_PARENT}>
              <Spacer data-spacer={id} height={height} />
            </div>
          ))}
          <div style={SPACER_ROW}>
            <Spacer data-spacer="w100" width="100%" height={8} />
          </div>
          <Spacer data-spacer="w30" width={30} height={8} />
          <span data-spacer-probe="ch2" style={SPACER_CH_PROBE} />
          <Spacer
            data-spacer="indicator"
            height="2rem"
            debugging="visible"
            indicatorNode={(value) => String(value)}
          />
        </Config>
      </section>
      <section data-spacer-grid="rem" style={SPACER_SECTION}>
        <Config base="0.5rem">
          <Spacer data-spacer="rem13" height="1.3rem" />
        </Config>
      </section>
    </>
  )
}

/** Lets tests switch a Box's snapping mode and content height. */
function SnapModeProbe() {
  const [mode, setMode] = useState<'clamp' | 'none'>('clamp')
  const [height, setHeight] = useState(100)
  useEffect(() => {
    ;(
      window as unknown as {
        __setSnapProbe: (next: {
          mode?: 'clamp' | 'none'
          height?: number
        }) => void
      }
    ).__setSnapProbe = (next) => {
      if (next.mode) setMode(next.mode)
      if (next.height !== undefined) setHeight(next.height)
    }
  }, [])
  return (
    <Box id="mode-probe" snapping={mode} block={[0, 0]}>
      <div style={{ height }} />
    </Box>
  )
}

/** A Box whose `as` changes at runtime, which renders a new host. */
function AsSwitchProbe() {
  const [as, setAs] = useState<'p' | 'h2'>('p')
  const [height, setHeight] = useState(100)
  useEffect(() => {
    ;(
      window as unknown as {
        __setAsProbe: (next: { as?: 'p' | 'h2'; height?: number }) => void
      }
    ).__setAsProbe = (next) => {
      if (next.as) setAs(next.as)
      if (next.height !== undefined) setHeight(next.height)
    }
  }, [])
  return (
    <Box id="as-probe" as={as} snapping="height" block={[0, 0]}>
      <span style={{ display: 'block', height }} />
    </Box>
  )
}

/** Changes its padding in a mount effect, before a second measurement. */
function MountFlipProbe() {
  const [block, setBlock] = useState<[number, number]>([0, 0])
  useEffect(() => setBlock([0, 4]), [])
  return (
    <Box id="mount-flip-probe" snapping="clamp" block={block}>
      <div style={{ height: 100 }} />
    </Box>
  )
}

/** Switches Box props in the microtask after the first snap commits. */
function PropsAfterSnapProbe() {
  const [edge, setEdge] = useState<'bottom' | 'top'>('bottom')
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const observer = new MutationObserver(() => {
      observer.disconnect()
      setEdge('top')
    })
    observer.observe(ref.current!, {
      subtree: true,
      attributes: true,
      attributeFilter: ['style'],
    })
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ display: 'flow-root' }}>
      <Box
        id="props-after-snap"
        snapping="height"
        snapEdge={edge}
        block={[0, 0]}
      >
        <div style={{ height: 100 }} />
      </Box>
    </div>
  )
}

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

function StatefulBoxDebugModeProbe({
  id,
  className,
}: {
  id: string
  className?: string
}) {
  const [debugging, setDebugging] = useState<'visible' | 'hidden' | 'none'>(
    'visible'
  )
  const [value, setValue] = useState('before toggle')

  return (
    <section id={`${id}-transition`}>
      <Box
        id={`${id}-host`}
        className={className}
        block={8}
        debugging={debugging}
        snapping="none"
      >
        <input
          id={`${id}-child`}
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
        />
      </Box>
      <button
        id={`${id}-toggle`}
        onClick={() =>
          setDebugging((mode) =>
            mode === 'visible'
              ? 'hidden'
              : mode === 'hidden'
                ? 'none'
                : 'visible'
          )
        }
      >
        Toggle Box debug mode
      </button>
    </section>
  )
}

export function App({ search = '' }: { search?: string }) {
  const params = new URLSearchParams(search)
  const remGrid = params.has('remgrid')
  const cost = params.get('cost')
  const content = (
    <main>
      {(cost === 'rem' || cost === 'px') && <CostFixture kind={cost} />}
      {params.has('spacers') && <SpacerStringsFixture />}
      {remGrid && (
        <>
          <RemGridFixture base="0.5rem" />
          <RemGridFixture base={8} />
        </>
      )}
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
      <StatefulBoxDebugModeProbe id="box-debug-merged" />
      <StatefulBoxDebugModeProbe
        id="box-debug-separated"
        className="caller-layout"
      />

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

      <section id="caller-css">
        <style>{`.caller-flex { display: flex; }`}</style>
        <Box id="caller-class-box" className="caller-flex">
          Caller class
        </Box>
        <Box id="trim-box" debugging="none">
          <p style={{ margin: 0 }}>Box child</p>
        </Box>
        <Padder id="trim-padder" debugging="hidden">
          <p style={{ margin: 0 }}>Padder child</p>
        </Padder>
        <Padder id="trim-padder-none" debugging="none">
          <p style={{ margin: 0 }}>Padder child</p>
        </Padder>
      </section>

      <section id="nested-snap" style={{ display: 'flow-root' }}>
        <Box id="nested-snap-outer">
          <Box>Sphinx of black quartz, judge my vow</Box>
        </Box>
        <Box as="p">Semantic paragraph one</Box>
        <Box as="p">Semantic paragraph two</Box>
        <Box>
          <Spacer height={12} />
        </Box>
      </section>

      <LiveGridFixture />

      <section id="snap-probes">
        <SnapModeProbe />
        <PropsAfterSnapProbe />
        <MountFlipProbe />
        <AsSwitchProbe />
      </section>

      <section id="late-and-margins">
        <style>{`p { margin: 1em 0; } .caller-mt { margin-top: 16px; }`}</style>
        <Box id="late-box" snapping="height" block={[0, 0]}>
          <div id="late-content" style={{ height: '10px' }} />
        </Box>
        <Box id="reset-p" as="p">
          Element margin
        </Box>
        <Box id="caller-p" as="p" className="caller-mt">
          Caller margin
        </Box>
      </section>

      <section id="precision">
        <div style={{ zoom: 1.25 }}>
          <Box id="precision-zoom" snapping="height" block={[0, 0]}>
            <div style={{ height: '10.5px' }} />
          </Box>
        </div>
        <Box id="precision-unit" snapping="height" block={[0, 0]}>
          <div style={{ height: '8.015625px' }} />
        </Box>
      </section>

      <section id="grid-exact">
        <Padder id="grid-padder" debugging="hidden" block={[8, 8]}>
          <div style={{ height: '8.296875px' }} />
        </Padder>
        <Box id="nested-outer" snapping="none">
          <Box
            id="nested-inner"
            snapping="height"
            snapEdge="top"
            block={[0, 0]}
          >
            <div style={{ height: '10.5px' }} />
          </Box>
        </Box>
      </section>

      <section id="box-snap-top-fractional">
        <Box
          snapping="height"
          snapEdge="top"
          debugging="visible"
          block={[0, 0]}
        >
          <div style={{ width: 20, height: '10.5px' }}>
            React fractional top snap consumer
          </div>
        </Box>
      </section>

      <section id="box-semantic-host">
        <div style={{ width: 400 }}>
          <Box
            id="react-semantic-sized"
            as="h3"
            width="50%"
            snapping="height"
            snapEdge="top"
            block={[0, 0]}
            style={{ borderBottom: '1px solid', paddingTop: '3px' }}
          >
            Sized semantic heading
          </Box>
        </div>
        <Box
          id="react-semantic-label"
          as="label"
          htmlFor="react-semantic-input"
        >
          Semantic host label
        </Box>
        <input id="react-semantic-input" />
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
