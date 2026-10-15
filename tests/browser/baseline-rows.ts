/**
 * The `?rows` fixture (issue #36), shared by the React and Remix entries.
 *
 * Baseline rows: every Box and Padder DOM variant next to a reference run of
 * text, in a flex, grid or inline parent aligned on the first or last
 * baseline. Each word carries a zero-size marker whose top is its line's
 * baseline, kept on the word's line by a no-wrap span.
 *
 * Geometry: Boxes and Padders with fixed padding, each beside a twin slot the
 * test fills with the markup 7.1.2 rendered for the same props (`GEO_TWINS`)
 * under that release's grid rules (`LEGACY_CSS`), so a change to the DOM or
 * stylesheet can be compared with the layout it replaces.
 */

/** A node both entries render: text, or an element with props and children. */
export type RowNode =
  | string
  | {
      type: 'Box' | 'Padder' | 'div' | 'span' | 'i' | 'button'
      props?: Record<string, unknown>
      children?: RowNode[]
    }

export const ROW_WORDS_ONE = ['Sphinx', 'of', 'quartz']
export const ROW_WORDS_MANY =
  'Sphinx of black quartz, judge my vow; the five boxing wizards jump quickly.'.split(
    ' '
  )

/** Words with a baseline marker each, separated by spaces. */
export function rowWords(words: string[]): RowNode[] {
  return words.flatMap((word, index) => [
    ...(index ? [' '] : []),
    {
      type: 'span' as const,
      props: { className: 'w' },
      children: [{ type: 'i' as const, props: { className: 'm' } }, word],
    },
  ])
}

/** The same words as HTML, for the twins. */
export function rowWordsHtml(words: string[]) {
  return words
    .map((word) => `<span class="w"><i class="m"></i>${word}</span>`)
    .join(' ')
}

/**
 * Box and Padder DOM variants: merged Box (own grid), semantic Box (inner
 * grid), Box with a separate Padder drawing spacers (`className`) or CSS
 * padding (`debugging="none"`), Padder with spacers, Padder without spacers
 * (no content host), a Box nested in a Box, and an empty Box.
 */
export const ROW_VARIANTS = [
  'merged',
  'merged-visible',
  'semantic-h3',
  'semantic-p',
  'separate',
  'separate-visible',
  'separate-plain',
  'padder',
  'padder-plain',
  'nested',
  'empty',
] as const
export type RowVariant = (typeof ROW_VARIANTS)[number]

/** `top` and `flat` are fixed block padding; `snap` snaps the top edge. */
export type RowPad = 'top' | 'flat' | 'snap'
/** `inline` makes the Box inline-grid; `span` spans it over two grid rows. */
export type RowParent = 'flex' | 'grid' | 'inline' | 'span'

export interface RowCase {
  id: string
  variant: RowVariant
  parent: RowParent
  align: 'baseline' | 'last baseline'
  lines: 1 | 3
  pad: RowPad
  edge: 'ex' | 'cap'
}

function rowCases() {
  const cases: RowCase[] = []
  const add = (
    variant: RowVariant,
    parent: RowParent,
    align: RowCase['align']
  ) => {
    for (const lines of [1, 3] as const) {
      for (const pad of ['top', 'flat', 'snap'] as const) {
        for (const edge of ['ex', 'cap'] as const) {
          cases.push({
            id: [
              variant,
              parent,
              align.replace(' ', '-'),
              lines,
              pad,
              edge,
            ].join('|'),
            variant,
            parent,
            align,
            lines,
            pad,
            edge,
          })
        }
      }
    }
  }
  for (const variant of ROW_VARIANTS) {
    for (const parent of ['flex', 'grid'] as const) {
      for (const align of ['baseline', 'last baseline'] as const) {
        add(variant, parent, align)
      }
    }
  }
  // An inline-level Box aligns its first baseline, as does a Box spanning
  // grid rows with the reference in its first row.
  add('merged', 'inline', 'baseline')
  add('merged', 'span', 'baseline')
  return cases
}

export const ROW_CASES = rowCases()

const PAD: Record<RowPad, Record<string, unknown>> = {
  top: { snapping: 'none', block: [8, 6] },
  flat: { snapping: 'none', block: [0, 6] },
  snap: { snapping: 'height', snapEdge: 'top', block: [0, 0] },
}

/** Marks the outermost Box or Padder, which the row and geometry CSS size. */
function subject(node: RowNode): RowNode {
  if (typeof node === 'string') return node
  return { ...node, props: { ...node.props, 'data-subject': '' } }
}

/** The Box or Padder a row aligns against its reference text. */
export function rowSubject(row: RowCase): RowNode {
  return subject(rowSubjectNode(row))
}

function rowSubjectNode(row: RowCase): RowNode {
  const words = rowWords(row.lines === 1 ? ROW_WORDS_ONE : ROW_WORDS_MANY)
  const box = { ...PAD[row.pad], inline: [8, 10] }
  // Padders always snap their height; `snap` leaves their padding at zero.
  const padder = {
    block: row.pad === 'top' ? [8, 6] : row.pad === 'flat' ? [0, 6] : [0, 0],
    inline: [8, 10],
  }
  const text: RowNode = {
    type: 'div',
    props: { className: 'rows-text' },
    children: words,
  }
  switch (row.variant) {
    case 'merged':
      return {
        type: 'Box',
        props: { ...box, ...(row.parent === 'span' ? { rowSpan: 2 } : {}) },
        children: words,
      }
    case 'merged-visible':
      return {
        type: 'Box',
        props: { ...box, debugging: 'visible' },
        children: words,
      }
    case 'semantic-h3':
      return { type: 'Box', props: { ...box, as: 'h3' }, children: words }
    case 'semantic-p':
      return { type: 'Box', props: { ...box, as: 'p' }, children: words }
    case 'separate':
      return {
        type: 'Box',
        props: { ...box, className: 'rows-c' },
        children: words,
      }
    case 'separate-visible':
      return {
        type: 'Box',
        props: { ...box, className: 'rows-c', debugging: 'visible' },
        children: words,
      }
    case 'separate-plain':
      return {
        type: 'Box',
        props: { ...box, className: 'rows-c', debugging: 'none' },
        children: words,
      }
    case 'padder':
      return { type: 'Padder', props: padder, children: [text] }
    case 'padder-plain':
      return {
        type: 'Padder',
        props: { ...padder, debugging: 'none' },
        children: [text],
      }
    case 'nested':
      return {
        type: 'Box',
        props: box,
        children: [
          {
            type: 'Box',
            props: { snapping: 'none', block: [4, 2] },
            children: words,
          },
        ],
      }
    case 'empty':
      return { type: 'Box', props: box, children: [] }
  }
}

/** The row element's class: parent layout, width and trim edge. */
export function rowClass(row: RowCase) {
  return [
    'rows-row',
    `rows-${row.parent}`,
    ...(row.lines === 3 ? ['rows-narrow'] : []),
    ...(row.edge === 'cap' ? ['rows-cap'] : []),
  ].join(' ')
}

// The Remix fixture escapes '>' in style text, so these rules use no child
// combinator: [data-subject] marks the element they size.
export const ROWS_CSS = `
.rows, .geo { font: 16px/24px serif; }
.rows h3, .rows p, .geo h3 { font: inherit; }
.rows .m, .geo .m { display: inline-block; width: 0; height: 0; }
.rows .w, .geo .w { white-space: nowrap; }
.rows-row { margin: 16px 0; gap: 8px; }
.rows-flex { display: flex; }
.rows-grid { display: grid; grid-auto-flow: column; justify-content: start; }
.rows-inline { display: block; }
.rows-inline [data-subject] { display: inline-grid; margin-inline-start: 8px; }
.rows-span {
  display: grid;
  grid-template-columns: auto auto;
  justify-content: start;
}
.rows-ref { white-space: nowrap; }
.rows-narrow [data-subject] { width: 220px; }
.rows-cap .bk-pad-content { text-box-edge: cap alphabetic; }
.geo-row { display: flex; gap: 16px; align-items: start; margin: 16px 0; }
.geo-narrow [data-subject] { width: 220px; }
.geo-overflow [data-subject] { overflow: auto; }
.geo [data-hit] { font: 16px/16px serif; padding: 6px 12px; border: 1px solid; }
`

/**
 * Geometry cases: a fixture and its 7.1.2 twin, with fixed padding. The test
 * marks each twin's host with data-subject too.
 */
export const GEO_CASES: { id: string; className: string; node: RowNode }[] =
  (() => {
    const words = rowWords(ROW_WORDS_MANY)
    const box = { snapping: 'none', block: [8, 6], inline: [8, 10] }
    // 40px of block content on an 8px grid: Padder snapping keeps 8px.
    const pad = { block: [8, 8], inline: [8, 8] }
    const block: RowNode = { type: 'div', props: { style: { height: '40px' } } }
    const Box = (props: Record<string, unknown>, children = words) =>
      subject({ type: 'Box', props: { ...box, ...props }, children })
    const Padder = (props: Record<string, unknown>) =>
      subject({
        type: 'Padder',
        props: { ...pad, ...props },
        children: [block],
      })
    return [
      { id: 'merged', className: 'geo-narrow', node: Box({}) },
      {
        id: 'merged-visible',
        className: 'geo-narrow',
        node: Box({ debugging: 'visible' }),
      },
      { id: 'semantic', className: 'geo-narrow', node: Box({ as: 'h3' }) },
      {
        id: 'separate',
        className: 'geo-narrow',
        node: Box({ className: 'geo-c' }),
      },
      {
        id: 'separate-visible',
        className: 'geo-narrow',
        node: Box({ className: 'geo-c', debugging: 'visible' }),
      },
      {
        id: 'separate-plain',
        className: 'geo-narrow',
        node: Box({ className: 'geo-c', debugging: 'none' }),
      },
      {
        id: 'nested',
        className: 'geo-narrow',
        node: Box({}, [
          {
            type: 'Box',
            props: { snapping: 'none', block: [4, 2] },
            children: words,
          },
        ]),
      },
      {
        id: 'overflow-merged',
        className: 'geo-narrow geo-overflow',
        node: Box({ height: 40 }),
      },
      {
        id: 'overflow-separate',
        className: 'geo-narrow geo-overflow',
        node: Box({ className: 'geo-c', height: 40 }),
      },
      {
        id: 'pct-merged',
        className: 'geo-narrow',
        node: Box({ height: 40 }, [
          {
            type: 'div',
            props: { 'data-geo-pct': '', style: { height: '100%' } },
            children: words,
          },
        ]),
      },
      { id: 'padder', className: '', node: Padder({}) },
      {
        id: 'padder-visible',
        className: '',
        node: Padder({ debugging: 'visible' }),
      },
      {
        id: 'padder-plain',
        className: '',
        node: Padder({ debugging: 'none' }),
      },
      {
        id: 'overflow-padder',
        className: '',
        node: Padder({ height: 24 }),
      },
    ]
  })()

/**
 * A Box drawing spacers whose first-line button reaches past the trimmed
 * content into the top and bottom padding: the button, not a spacer, must
 * take the pointer there.
 */
export const HIT_NODE: RowNode = subject({
  type: 'Box',
  props: {
    className: 'geo-c',
    snapping: 'none',
    block: [16, 16],
    inline: [16, 16],
  },
  children: [{ type: 'button', props: { 'data-hit': '' }, children: ['Save'] }],
})

/**
 * What 7.1.2 rendered for each `GEO_CASES` entry (react-dom/server, classes
 * renamed to `lg-*`); `__TEXT__` stands for `rowWordsHtml(ROW_WORDS_MANY)`.
 */
export const GEO_TWINS: Record<string, string> = {
  merged:
    '<div class="lg-box" style="grid-template-rows:8px 1fr 6px;grid-template-columns:8px 1fr 10px"><div class="lg-pad-content">__TEXT__</div></div>',
  'merged-visible':
    '<div class="lg-box bk-v lg-pad-visible" style="grid-template-rows:8px 1fr 6px;grid-template-columns:8px 1fr 10px;--bkpd-is:8px;--bkpd-ie:6px"><div class="lg-pad-content">__TEXT__</div></div>',
  semantic:
    '<h3 class="lg-box lg-semantic"><span class="lg-grid" style="grid-template-rows:8px 1fr 6px;grid-template-columns:8px 1fr 10px"><span class="lg-pad-content">__TEXT__</span></span></h3>',
  separate:
    '<div class="lg-box lg-separate geo-c"><div class="lg-pad"><div class="lg-pad-top"><div class="bk-spr" style="--bksp-h:8px"></div></div><div class="lg-pad-left"><div class="bk-spr" style="--bksp-w:8px"></div></div><div class="lg-pad-content">__TEXT__</div><div class="lg-pad-right"><div class="bk-spr" style="--bksp-w:10px"></div></div><div class="lg-pad-bottom"><div class="bk-spr" style="--bksp-h:6px"></div></div></div></div>',
  'separate-visible':
    '<div class="lg-box bk-v lg-separate geo-c"><div class="lg-pad bk-v"><div class="lg-pad-top"><div class="bk-spr bk-flat" style="--bksp-h:8px"></div></div><div class="lg-pad-left"><div class="bk-spr bk-flat" style="--bksp-w:8px"></div></div><div class="lg-pad-content">__TEXT__</div><div class="lg-pad-right"><div class="bk-spr bk-flat" style="--bksp-w:10px"></div></div><div class="lg-pad-bottom"><div class="bk-spr bk-flat" style="--bksp-h:6px"></div></div></div></div>',
  'separate-plain':
    '<div class="lg-box lg-separate geo-c"><div class="lg-pad lg-pad-plain" style="padding-block:8px 6px;padding-inline:8px 10px"><div class="lg-pad-content">__TEXT__</div></div></div>',
  nested:
    '<div class="lg-box" style="grid-template-rows:8px 1fr 6px;grid-template-columns:8px 1fr 10px"><div class="lg-pad-content"><div class="lg-box" style="grid-template-rows:4px 1fr 2px"><div class="lg-pad-content">__TEXT__</div></div></div></div>',
  'overflow-merged':
    '<div class="lg-box" style="--bkbx-h:40px;grid-template-rows:8px 1fr 6px;grid-template-columns:8px 1fr 10px"><div class="lg-pad-content">__TEXT__</div></div>',
  'overflow-separate':
    '<div class="lg-box lg-separate geo-c" style="--bkbx-h:40px"><div class="lg-pad" style="--bkpd-h:40px"><div class="lg-pad-top"><div class="bk-spr" style="--bksp-h:8px"></div></div><div class="lg-pad-left"><div class="bk-spr" style="--bksp-w:8px"></div></div><div class="lg-pad-content">__TEXT__</div><div class="lg-pad-right"><div class="bk-spr" style="--bksp-w:10px"></div></div><div class="lg-pad-bottom"><div class="bk-spr" style="--bksp-h:6px"></div></div></div></div>',
  'pct-merged':
    '<div class="lg-box" style="--bkbx-h:40px;grid-template-rows:8px 1fr 6px;grid-template-columns:8px 1fr 10px"><div class="lg-pad-content"><div data-geo-pct="" style="height:100%">__TEXT__</div></div></div>',
  padder:
    '<div class="lg-pad"><div class="lg-pad-top"><div class="bk-spr" style="--bksp-h:8px"></div></div><div class="lg-pad-left"><div class="bk-spr" style="--bksp-w:8px"></div></div><div class="lg-pad-content"><div style="height:40px"></div></div><div class="lg-pad-right"><div class="bk-spr" style="--bksp-w:8px"></div></div><div class="lg-pad-bottom"><div class="bk-spr" style="--bksp-h:8px"></div></div></div>',
  'padder-visible':
    '<div class="lg-pad bk-v"><div class="lg-pad-top"><div class="bk-spr bk-line" style="--bksp-h:8px"></div></div><div class="lg-pad-left"><div class="bk-spr bk-line" style="--bksp-w:8px"></div></div><div class="lg-pad-content"><div style="height:40px"></div></div><div class="lg-pad-right"><div class="bk-spr bk-line" style="--bksp-w:8px"></div></div><div class="lg-pad-bottom"><div class="bk-spr bk-line" style="--bksp-h:8px"></div></div></div>',
  'padder-plain':
    '<div class="lg-pad lg-pad-plain" style="padding-block:8px 8px;padding-inline:8px 8px"><div style="height:40px"></div></div>',
  'overflow-padder':
    '<div class="lg-pad" style="--bkpd-h:24px"><div class="lg-pad-top"><div class="bk-spr" style="--bksp-h:8px"></div></div><div class="lg-pad-left"><div class="bk-spr" style="--bksp-w:8px"></div></div><div class="lg-pad-content"><div style="height:40px"></div></div><div class="lg-pad-right"><div class="bk-spr" style="--bksp-w:8px"></div></div><div class="lg-pad-bottom"><div class="bk-spr" style="--bksp-h:8px"></div></div></div>',
}

/** 7.1.2's Box and Padder grid rules, renamed to the twins' `lg-*` classes. */
export const LEGACY_CSS = `
.lg-box {
  --bkbx-w: fit-content;
  --bkbx-h: fit-content;
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto 1fr auto;
  width: var(--bkbx-w);
  height: var(--bkbx-h);
  text-box-trim: trim-both;
  text-box-edge: ex alphabetic;
}
.lg-box:where(.lg-semantic, .lg-separate) { display: block; }
.lg-box:where(.lg-semantic) { margin-block: 0; }
.lg-grid {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  text-box-trim: trim-both;
  text-box-edge: ex alphabetic;
}
.lg-pad {
  --bkpd-w: fit-content;
  --bkpd-h: fit-content;
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto 1fr auto;
  width: var(--bkpd-w);
  height: var(--bkpd-h);
  text-box-trim: trim-both;
  text-box-edge: ex alphabetic;
}
.lg-pad-content {
  grid-row: 2 / 3;
  grid-column: 2 / 3;
  text-box-trim: trim-both;
  text-box-edge: ex alphabetic;
}
:where(.lg-box, .lg-grid, .lg-box > .lg-pad) > .lg-pad-content > :where(*) {
  text-box-trim: trim-both;
  text-box-edge: ex alphabetic;
}
.lg-pad-top { grid-row: 1 / 2; grid-column: 1 / -1; }
.lg-pad-left { grid-row: 2 / 3; grid-column: 1 / 2; }
.lg-pad-right { grid-row: 2 / 3; grid-column: 3 / 4; }
.lg-pad-bottom { grid-row: 3 / 4; grid-column: 1 / -1; }
`

/**
 * Transition scopes for the live grid: each wraps one host per DOM variant,
 * and its rule animates whatever carries the padding when it sits on the host,
 * the inner grid, the content host or its margins only, or everywhere.
 */
export const LIVE_SCOPES = [
  'none',
  'host',
  'grid',
  'content',
  'margin',
  'all',
] as const

export const LIVE_SCOPE_CSS = `
[data-live-scope="host"] [data-live="scope"],
[data-live-scope="grid"] :is(.bk-box__grid, [data-live="scope"] .bk-pad),
[data-live-scope="content"] .bk-pad-content,
[data-live-scope="all"] [data-live="scope"],
[data-live-scope="all"] [data-live="scope"] * {
  transition: all 120ms linear;
}
[data-live-scope="margin"] .bk-pad-content {
  transition: margin-block 120ms linear;
}
`
