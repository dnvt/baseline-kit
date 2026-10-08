# Baseline Kit

![Build Status](https://img.shields.io/github/actions/workflow/status/dnvt/baseline-kit/test.yml)
![npm version](https://img.shields.io/npm/v/baseline-kit)
![License](https://img.shields.io/github/license/dnvt/baseline-kit)

Baseline Kit grew from my [Padded Grid article](https://medium.com/design-bootcamp/the-padded-grid-a-designers-hack-to-achieve-baseline-fit-fc40d022bc84),
which explores aligning text baselines and component bounds to an 8px grid.
Baseline Kit turns that idea into a reusable pattern: wrap text in `Box` with
`snapping="height"` and `snapEdge="top"`. Height snapping rounds the Box up to
the next grid interval; top snapping puts the correction above the text. The
final baseline stays on the grid when the Box begins on a grid line and its
bottom padding is a multiple of the base. `Baseline` and `Guide` visualize the
grid; `Padder`, `Spacer`, and `Config` handle spacing and defaults. A
React-free adapter is available for Remix 3.

![Demo visual](https://raw.githubusercontent.com/dnvt/baseline-kit/main/kit.png)

## Install

For React:

```shell
npm install baseline-kit react@19 react-dom@19
```

For the React-free Remix 3 adapter:

```shell
npm install baseline-kit remix@3.0.0
```

Baseline Kit includes TypeScript declarations. React and Remix are optional
peer dependencies. React use requires Node.js 18+; Remix 3.0.0 requires
Node.js 24.3+. TypeScript 5.8, 6, or 7 is supported.

## React quick start

```tsx
import 'baseline-kit/styles'
import 'baseline-kit/theme'
import { Baseline, Box, Config, Guide } from 'baseline-kit'

export function App() {
  return (
    <Config base={8}>
      <main className="layout">
        <Baseline height="100%" debugging="visible" />
        <Guide variant="fixed" columns={12} debugging="visible" />
        <Box snapping="height" snapEdge="top">
          <p className="copy">Text aligned to the 8px baseline grid.</p>
        </Box>
      </main>
    </Config>
  )
}
```

```css
.layout {
  position: relative;
  height: 100vh;
}

.copy {
  margin: 0;
  text-box-trim: trim-both;
  text-box-edge: ex alphabetic;
}
```

### Text on the baseline grid

Use a `Box` around each text block with `snapping="height"` and
`snapEdge="top"`. Baseline Kit uses `text-box-trim: trim-both` and
`text-box-edge: ex alphabetic` on `Box` and `Padder`. This trims the text
block from the x-height to the alphabetic baseline, so the end of its measured
text height is exactly at the baseline. `snapEdge="top"` puts any height
correction above the text. With a grid-aligned Box start and block-end padding
that is a multiple of the base (8px by default), the baseline stays on the grid.

Text-box properties do not inherit. Baseline Kit applies them to text directly
inside its wrappers; apply them to nested paragraphs, headings, or other text
containers too. For multiline text, set `line-height` to a multiple of the base
if every line baseline must align. Browsers without text-box support keep their
normal text metrics. See the
[text-box-edge reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-box-edge)
for details and compatibility.

## Spacing and snapping

The baseline interval is `8px` by default. Set it with `Config base={...}`.
Numeric spacing values are CSS pixels, not multiples of the base. For example:

```tsx
<Padder block={[16, 24]} inline={{ start: 8, end: 16 }}>
  Content
</Padder>
```

Spacing props accept CSS-like values: `padding={16}` sets all sides,
`padding={[8, 16]}` sets block and inline pairs, `block={[16, 24]}` sets
block-start/end, and `inline={{ start: 8, end: 16 }}` sets inline-start/end.
Three- and four-value `padding` arrays follow CSS shorthand.

`Box` defaults to `snapping="clamp"`. Use `height` to round its measured height
up to the next base interval; the correction goes to the bottom by default.
Set `snapEdge="top"` to place it above the text instead. `snapping="none"`
keeps explicit spacing. Snapping runs after the first nonzero measurement, not
continuously on resize. `Padder` uses height snapping with bottom correction;
set `ssrMode` to keep its explicit padding without measurement.

## Components and styles

| Component | Purpose |
| --- | --- |
| `Baseline` | Horizontal baseline-grid overlay. |
| `Guide` | Responsive or fixed column-grid overlay. |
| `Box` | Wraps content and can snap its height. |
| `Padder` | Adds baseline-aware padding. |
| `Spacer` | Adds a fixed-size spacer. |
| `Config` | Sets scoped base, colors, variants, and debugging defaults. |

Import only the JavaScript and CSS entries the app uses:

| Use | JavaScript | CSS |
| --- | --- | --- |
| React components | `baseline-kit` | `baseline-kit/styles` and `baseline-kit/theme` |
| React Guide only | `baseline-kit/guide` | `baseline-kit/styles/guide` |
| Remix 3 components | `baseline-kit/remix` | `baseline-kit/styles/remix` |
| Core utilities | `baseline-kit/core` | None |

`baseline-kit/styles/full` combines the React styles and theme. The default
theme follows `prefers-color-scheme`; use `baseline-kit/theme/default` or
`baseline-kit/theme/dark` to choose one. For custom colors, use `Config` or
copy the [theme token template](https://github.com/dnvt/baseline-kit/blob/main/packages/react/src/components/styles/theme/tokens.css).
An optional reset is available from `baseline-kit/reset` or
`baseline-kit/styles/reset`.

Debugging can be `visible`, `hidden`, or `none`: show debug paint, hide paint
while preserving layout, or disable debug elements. Baseline and Guide are
`aria-hidden` overlays; keep meaningful content outside them. Diagnostic
attributes are omitted by default; enable them for a subtree with
`<Config domDiagnostics>`.

## Remix 3

The adapter uses `remix/component` and does not import React or React DOM:

```tsx
import 'baseline-kit/styles/remix'
import { Box, Config } from 'baseline-kit/remix'
import { jsx } from 'remix/component/jsx-runtime'

export function App() {
  return jsx(Config, {
    base: 8,
    children: jsx(Box, { children: 'Native Remix content' }),
  })
}
```

For Node.js server rendering, use `baseline-kit/remix/server` instead of
`remix/component/server`. Remix 3.0.0 loses provider context while serializing
component-valued children; the Baseline Kit entry fixes that traversal in an
isolated renderer and checks the installed runtime before using it. This is a
Node-only entry, so keep the installed Remix runtime files in production. Its
`resolveClientEntry` callback must map entries, including app entries, to
browser-served JavaScript assets. Import `ImportMap` from this server entry
when needed; `Frame` and client components still come from `remix/component`.

See the [server resolver example](https://github.com/dnvt/baseline-kit/blob/main/tests/browser/remix-ssr.ts)
and [asset-serving fixture](https://github.com/dnvt/baseline-kit/blob/main/tests/browser/vite.config.ts).

## Contributing and license

See [CONTRIBUTING.md](https://github.com/dnvt/baseline-kit/blob/main/CONTRIBUTING.md)
for contribution guidelines. Baseline Kit is MIT licensed. ©
[François Denavaut](https://github.com/dnvt).
