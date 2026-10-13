# baseline-kit

## 7.1.1

### Patch Changes

- c50f2af: Follow-ups to 7.1.0's live unit strings:

  - A `var()` fallback must fit where the `var()` is: a Spacer height of `var(--gap, 2)` now keeps the base fallback instead of collapsing to 0px when `--gap` is unset, while `calc(var(--n, 2) * 1rem)` stays live.
  - Spacer heights also follow `round()`, `mod()` and `rem()` inside math (same browser support as `round()`), and custom property names with non-ASCII characters (`var(--größe)`).
  - Unit conversion reads only its own unit names: `'10constructor'` no longer converts to NaN.
  - README: a string width goes to CSS as written, so a browser that lacks one of its units keeps the Spacer's default width.

## 7.1.0

### Minor Changes

- 04a1b7e: `Box` and `Padder` follow their content: they re-snap whenever their content height changes (a web font loading, a font or size change, text rewrapping at a new width, a new root font size), in React and Remix. In 7.0 they followed content changes only for two seconds after a snap, after a web font loaded, or when the tab became visible, so a later change left them off the grid until their props changed or they remounted.

  - Snapping uses the padding the DOM actually renders, so a CSS transition on a Box's padding no longer sets off repeated snaps.
  - Snapped block padding is kept to 1/1024px, so padding read back from the DOM (computed styles round it to six significant digits) no longer leaves a Box a layout unit short of the grid in Chromium and WebKit.
  - A Box whose height is held from outside (`min-height`, a stretched flex or grid item) settles within a few updates instead of alternating between two heights.
  - A content-driven Box updates at most once per change (a Padder around a Box once more, after it) and none update once sizes stop changing. It ends where a fresh load would, unless its content flickered in step with its corrections, which can leave it one base row taller (still on the grid) until its height next changes. Content that animates its height is followed frame by frame.
  - A Padder that draws no spacers (`debugging="none"`) carries a `bk-pad-plain` class, so its padding can be read back while it animates.
  - In browsers without `currentCSSZoom` (WebKit on Linux), CSS `zoom` on an ancestor is now measured by multiplying each ancestor's zoom. Boxes there snapped to the zoomed grid instead of the page's.
  - `SNAP_SETTLE_MS` is deprecated and no longer used.
  - `SnapMeasurement.settling` is optional and defaults to `true`; passing `false` still keeps the current snap. `SnapState` gains optional `measured` and `earlier` fields (type `SnapMeasured`).

- 04a1b7e: `Spacer` string sizes follow the page, in React and Remix. A CSS length height (`'3rem'`, `'10vh'`, `'50%'`, `'calc(100% - 23px)'`) still rounds to the base, now in CSS with `round()`, so it follows the root font size, the viewport and its container as they change; under a rem base it rounds to the rem value. A CSS length width renders as written.

  - 7.0 resolved size strings against a fixed 16px root and a 1920x1080 viewport. Now they resolve as CSS does: `%` heights (were 0px), `calc()` (was the base), `vh`/`vw` (were fixed), and `em`, which now means the Spacer's own font size (was a fixed 16px). `width="100%"` fills its container (was 0px).
  - Strings that aren't CSS lengths (`'auto'`, `'24'`, keywords, units newer than `round()` such as `lh` or `cqw`, malformed math such as `'calc(100%-23px)'`) keep 7.0's fallback to the base. Browsers without CSS `round()` (before Chrome 125, Firefox 118 and Safari 15.4) keep the px value for string heights: 7.0's value, except for the unit spellings conversion now reads (below).
  - An indicator for a string size shows the rendered size, measured after mount.
  - `SpacerDescriptor.style` carries a string height's live value in `--bksp-hl` (`--bksp-h` and `data-height` keep the px value) and a string width as written in `--bksp-w`. The core exports `isCSSLength`, and `SpacerDescriptorParams` gains an optional `baseRem`.
  - `Guide` accepts a string `gap` (`'1rem'`, `'2%'`). It resolves when the Guide renders (on mount, when its size changes, and for a rem `gap` or `columnWidth`, when the root font size changes) against the root font size, the viewport and the Guide's own width, then rounds to the base, so an `auto` Guide's column elements keep matching its CSS columns. It reads px, rem, `%`, viewport units and absolute units; `em` resolves against 16px and anything else, `calc()` included, falls back to the base. In 7.0 React drew no gap for a string, and Remix resolved a rem gap against a fixed 16px root and a `%` gap against 0px.
  - `%` gaps (every variant) and an `auto` Guide's `%` column width resolve against the Guide's width (7.0: 0px, so an `auto` Guide drew one column element).
  - Unit conversion (`convertValue`) reads units case-insensitively and every viewport unit form (`vi`, `vb`, `svh`, `dvmin`, ...). Values that used to be unreadable now convert: `convertValue('1PX')` is 1 (was null), a Spacer's px fallback for `'10dvh'` or `'2REM'` is the converted size instead of the base, and the same spellings now convert in an `auto` Guide's `columnWidth` and in a Baseline's size before its first measurement.
  - `GuideOptions.gap` widens to `number | string`; the core exports `isRootRelative`.

- 04a1b7e: `Config` accepts a base in rem, such as `base="0.5rem"`, so the grid follows the root font size, in React and Remix. When the root font size changes (a stylesheet, the reader's default font size), the base re-resolves and every `Box` and `Padder` re-snaps; text with a `line-height` in rem that is a multiple of the base keeps its lines a whole number of rows apart. The server renders a rem base at 16px; React hydrates that HTML without a mismatch and Remix patches the differences in place, then both switch to the live size. One hidden `1rem` element under `<html>` watches the root font size, there only while something follows it (a rem base, or a `Guide` with a rem `gap` or `columnWidth`).

  - `ConfigSchema.base` stays the resolved number in px; `ConfigSchema` gains an optional `baseRem` with the rem value.
  - `mergeConfig` accepts `rootFontSize` (default 16) to resolve a rem base, and warns once about a base that is neither a number nor a positive rem value. The core exports `BaseValue`, `DEFAULT_ROOT_FONT_SIZE`, `parseRemBase` and `resolveConfigBase`.
  - Component `base` props (`Baseline`, `Spacer`) still take numbers.
  - A root font size change can update a Box twice, once for the new base and once for the reflowed text; on a 100-Box page in Chromium it reaches the grid within one frame of a px base.

## 7.0.0

### Major Changes

- 508227b: One stylesheet and one set of rules for React and Remix 3.

  Breaking changes:

  - React components now render the same global `bk-*` classes as the Remix entry. The hashed CSS-module class names are gone. Every rule weighs one class, so a caller's own class loaded after the stylesheet overrides it; Remix modifier rules used to weigh two.
  - The stylesheet no longer declares component defaults on `:root` (`--bk-zio`, `--bk-width-default`, `--bk-height-default`, `--bkbx-ct`, and the `--bkbx-*`, `--bkbl-*`, `--bkgd-*`, `--bkpd-*`, `--bksp-*` defaults). Each component class declares its own. The `--bk-*-theme` tokens are unchanged. Baseline and Guide no longer set `--bkbl-c` and `--bkgd-line-color` inline.
  - Removed the `module` and `style` fields from `package.json`. Tools that resolved `@import 'baseline-kit'` through `style` should import `baseline-kit/styles`.
  - `baseline-kit/styles` is the only component stylesheet. Removed entries: `baseline-kit/styles/remix` (use `baseline-kit/styles`), `baseline-kit/styles/full` and `baseline-kit/full` (import `baseline-kit/styles` and `baseline-kit/theme`), `baseline-kit/styles/reset` (use `baseline-kit/reset`), `baseline-kit/theme/tokens` (copy the template from the repository), and the raw `baseline-kit/dist/*.css` paths.
  - Removed the `baseline-kit/guide` and `baseline-kit/styles/guide` entries. Import `Guide` from `baseline-kit` and use `baseline-kit/styles`.
  - Remix `Box` takes `htmlFor` instead of `for` with `as="label"`, matching React. A `Box` that still receives `for` logs a one-time warning, because `jsx()` calls don't get a type error.
  - Remix `Padder` now defaults to `fit-content` width like React. Previously it stretched, and `width="fit-content"` had no effect.
  - Removed undocumented exports: `isSSR` and `safeClientValue` from `baseline-kit`, and `GRID_ALIGNMENTS`, `GridAlignment`, `PADD_VARIANTS`, `PaddedVariant`, and `RELATIVE_UNITS` from `baseline-kit/core`.
  - Removed the undocumented `--bkbx-initial-is` first-paint hook from the Remix `Box`.
  - Removed `createStyleOverride` and `StyleOverrideParams` from `baseline-kit/core`.
  - The core descriptors now return host styles without the values the stylesheet already sets, and their `classTokens` include the variant (and `compact` for Baseline). `createBaselineDescriptor` now requires `domDiagnostics` (and takes `className` and `style`) and returns `compactPaint`. `createBoxDescriptor` now requires `padding` and `paddingColor` and returns `spacingStyle` and `paddingDebugStyle`. `createPadderDescriptor` no longer takes `base`.
  - React and Remix component props now come from the same core option types. React `width`, `height`, `columnWidth`, and `maxWidth` are typed `number | string`. React `Guide` no longer accepts `base`, and React `Guide` and `Spacer` forward only global attributes (`id`, `title`, `role`, `aria-*`, `data-*`, and similar) to the DOM, like the other components.
  - `Box` now trims the text box of its direct children in React too, as Remix already did, so paragraphs and headings placed directly inside measure shorter. `Padder` trims only its own content wrapper in both entries; the Remix `Padder` no longer trims its children.
  - Remix `Baseline` and `Guide` now fade in and out over 180ms like React, and Remix line guides shift left by a sub-pixel like React.
  - React `Guide` and `Spacer` props no longer include `padding`, `block`, and `inline`, which those components never applied.
  - The React `Box` ref is typed `HTMLElement` instead of `HTMLDivElement`, since `as` can render other elements.
  - `Spacer`s keep fractional sizes when the base is 1, which `Box` sets for its content: `<Box><Spacer height={10.4} /></Box>` is now 10.4px instead of 10px. In `hidden` and `visible` debugging, `Padder` draws its spacers at their exact sizes, so indicator values can be fractional and narrow inline spacers that used to round to 0 now render.
  - The unused `--bkpd-b` and `--bksp-b` custom properties are no longer set.

  Features:

  - React `Box` supports `as` and `htmlFor` for semantic hosts, like Remix. A semantic host drops the element's default block margins, which would sit outside the snapped height. The reset outweighs element resets such as normalize.css, and a class of your own loaded after the stylesheet wins over it. Layered utilities such as Tailwind's need Baseline Kit in a layer between their resets and utilities (see the README).
  - React `Box` paints the shaded padding bands in visible debug mode, like Remix.
  - `baseline-kit` and `baseline-kit/remix` export the same type names, including `BoxElement` and `ConfigProps`.
  - The CSS entry points declare types, so `import 'baseline-kit/styles'` type-checks with TypeScript's `noUncheckedSideEffectImports`, which TypeScript 6 and 7 turn on by default.
  - `baseline-kit/core` exports the shared component option types (`BaselineOptions`, `BoxOptions`, `GuideOptions`, `PadderOptions`, `SpacerOptions`, `BoxElement`), the server-fallback helpers `createBaselineFallbackStyle` and `createGuideFallbackStyle`, the style helpers `compactStyle` and `getDOMAttributes`, and the snapping helpers `isOnBaseline`, `getBaselineRemainder`, `removeSnapCorrection`, `nextSnap`, `getSnapKey`, `SNAP_TOLERANCE`, `SNAP_EPSILON`, and `SNAP_SETTLE_MS`. `calculateSnappedSpacing`, `getBaselineRemainder`, and `isOnBaseline` take an optional `scaled` flag for pages scaled by a fraction.
  - The `remix` peer range is now `^3.0.0`.

  Fixes:

  - Snapping snaps every remainder made of whole layout units (1/64px in Chromium and WebKit, 1/60px in Firefox) exactly, and treats smaller fractional residues up to 1/32px, which browser zoom, display scaling, and CSS `zoom` leave behind, as on the grid instead of adding an extra base row. Measurements account for CSS `zoom` on an ancestor, which used to break snapping. `Baseline` rounds its measured height, so sub-pixel noise cannot drop its last row or its compact paint.
  - React and Remix measure heights with fractional precision, so trimmed text snaps exactly onto the grid instead of drifting by up to half a pixel per Box. A `Spacer` with a base of 1 keeps fractional sizes, and `Padder` draws its spacers at base 1, so a `Padder` (or a `Box` with a `className`) lands exactly on the grid with debugging `hidden` or `visible` too.
  - A semantic `Box` with a percentage `width` or `height` no longer applies it twice.
  - A `Box` or `Padder` inside a `Box` no longer snaps on its own (snapping with a base of 1px or less leaves the padding unchanged), so it can't push the outer `Box` off the grid after the outer one has snapped.
  - A semantic `Box` snaps its whole element, including its own border and padding.
  - `baseline-kit/remix/server` checks the code it patches, and that it sits inside the function it reads from, instead of the whole file's hash, so a patch release of `@remix-run/component` no longer stops it from loading.
  - `baseline-kit/theme/dark` includes the dark spacer and padder colors. `baseline-kit/theme` is now generated from the light and dark themes.
  - Remix `.bk-flat` no longer paints flat Baseline hosts with the Spacer color.
  - Remix components release the observers of client entries that stay out of the document after another entry detaches, since Remix does not always dispose nested entries. Elements that are only moved or briefly detached keep measuring.
  - `Box` and `Padder` re-snap when their base, padding, or snapping props change (before, later changes could be ignored), and from their natural height (without their own correction) for two seconds after a snap and again when a web font finishes loading or the tab becomes visible, in React and Remix. Late fonts and nested Remix client entries that hydrate later (such as a `Spacer` inside a `Box`) no longer leave them off the grid. Outside those windows the snap stays fixed.
  - Remix client entries no longer serialize the default config into their props.
  - Remix `Padder` measures fractional heights like `Box`.
  - Remix server HTML marks `Baseline`, `Guide`, and `Spacer` indicators `aria-hidden="true"`. Before, the attribute was written without a value until hydration.
  - Measurement and virtualization fall back gracefully when `ResizeObserver` or `IntersectionObserver` is missing, such as in jsdom tests.

## 6.1.0

### Minor Changes

- Restore semantic host selection on the native Remix Box and update its SSR adapter for stable Remix 3.0.0.

## 6.0.0

### Major Changes

- a3d22e6: Generated diagnostic DOM attributes are now opt-in through `Config domDiagnostics`. Default component styles come from CSS modules, and zero-padding containers omit unused spacer helpers while retaining a stable content host. Baseline grids use CSS paint while retaining the same rendered pixels. Migrate DOM inspection to the opt-in diagnostics setting.

### Details

Longer notes for the work released in 5.2.0 and 6.0.0.

#### Breaking changes

- Library-generated DOM diagnostic attributes are opt-in through
  `<Config domDiagnostics />`. Applications that select components through
  generated `data-testid`, variant, dimension, row, or column attributes should
  enable diagnostics in those scopes. Caller-provided attributes remain.

#### Improvements

- Added the React-free Remix 3 entry point and its dedicated CSS entry.
- Added a Node-only Remix SSR compatibility entry that preserves nested Config
  context during serialization and fails closed if the pinned Remix renderer
  changes.
- Added TypeScript 7 compiler support while keeping lint and declaration tools
  on the official TypeScript 6 compatibility API until their TypeScript 7 APIs
  are released.
- Simplified the public documentation around entry points, sizing, themes,
  text-box alignment, SSR, and release checks.
- Moved default component values into host CSS classes, omitted redundant
  instance styles and diagnostic attributes, painted Baseline with CSS, and
  removed empty zero-padding spacer nodes while keeping nested Config and
  React/Remix rendering behavior.
- Removed unused CSS and linting dependencies, including `cssnano`.

#### Bug fixes

- Fixed relative browser sizing, scoped Config color propagation, and delayed
  hydration regressions across the React and native Remix adapters.
- Box and Padder now opt into `text-box: trim-both ex alphabetic` when the
  browser supports it, while retaining normal line boxes as a fallback.

## 5.2.0

### Minor Changes

- 906488c: Use readable TSX source for the native Remix adapter, keep Maestro workflow
  state local-only, and let Box choose whether height-snap correction goes to the
  top or bottom padding edge.

## 5.1.0

### Minor Changes

- fbc8acc: Validation complete: the delayed-entry nested Config regressions and complete
  browser matrix pass in the packed consumer. Version and publish this candidate
  through the normal Changesets workflow after review.

  Use the new Node-only `baseline-kit/remix/server` renderer for SSR with the
  pinned Remix RC. It preserves nested provider context during serialization,
  validates the upstream source digest, and leaves installed dependencies unchanged.

  Add a React-free `baseline-kit/remix` adapter and `baseline-kit/styles/remix`, tested with Remix 3.0.0-rc.2. React applications keep using the root or guide entry without installing Remix.

  Fix browser-resolved Baseline sizing, scoped Config color propagation, default paint without a theme, shared React Config across root/guide imports, and observer lifecycle regressions. Box and Padder now apply CSS text-box trimming using x-height (`ex`) and alphabetic baseline metrics; unsupported browsers retain normal line boxes.

  Update the public installation, SSR, asset loading, spacing, browser support, and contributor documentation. Keep internal workspaces private, include the changelog in npm packages, and verify browser behavior using the packed native adapter before release.

## 5.0.0

### Breaking changes

- **Removed `Layout` and `Stack` components.** The library now focuses on its
  core mission — baseline-grid visualization (`Baseline`, `Guide`) and spacing
  primitives (`Box`, `Padder`, `Spacer`, `Config`). The following exports are
  gone:
  - Components: `Layout`, `Stack`
  - Types: `LayoutProps`, `StackProps`
  - Pure descriptors: `createLayoutDescriptor`, `createStackDescriptor`,
    `getGridTemplate`, `LayoutDescriptor`, `LayoutDescriptorParams`,
    `StackDescriptor`, `StackDescriptorParams`, `DIRECTION_AXIS`
  - `Config` schema: `stack` and `layout` branches on `ConfigSchema`,
    corresponding `stack` / `layout` props on `<Config>`
  - CSS variables: `--bksk-*`, `--bkly-*`, and their themed counterparts
    `--bk-stack-color-*`, `--bk-layout-color-*`

  **Migration** — replace `<Layout>` with a plain `<div>` using `display: grid`
  (or your design system's grid wrapper), and `<Stack>` with `display: flex`:

  ```tsx
  // Before
  <Layout columns={3} gap={16}>{children}</Layout>
  <Stack direction="column" gap={8}>{children}</Stack>

  // After
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
    {children}
  </div>
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {children}
  </div>
  ```

### Bug fixes

- `Stack` gap / rowGap / columnGap values are now emitted with `px` units.
  Numeric gaps were stringified to unitless values (`"8"`), which browsers
  drop for non-zero `row-gap` / `column-gap` declarations, silently breaking
  spacing. _(This fix landed before the `Stack` component was retired; it
  matters now for any code still using `createStackDescriptor` from the core
  package up to 5.0.0 — though that descriptor itself has also been removed.)_
- `useBaseline` snapping now fires on the first real measurement. The previous
  implementation flipped a "did-snap" latch during the initial render (when
  `useMeasure` has not yet reported a height), so `Box` and `Padder` using
  `snapping="height"` or `"clamp"` silently skipped the snap entirely.
- `createMeasureObserver` and `createVirtualTracker` now cancel their pending
  `requestAnimationFrame` callback inside `disconnect()`. Previously an
  in-flight frame could invoke `onChange` after the consumer had already
  unmounted the observer.
- `calculateGuideTemplate` and `normalizeValue` accept a `ConversionContext`
  that threads the real browser viewport through for `vw` / `vh` / `vmin` /
  `vmax` conversion. The React hooks pass it via a new `getViewportContext()`
  helper in `@baseline-kit/dom`. Core stays zero-dependency.

### Architecture

- Source is now a monorepo under `packages/{core, dom, react}`.
  `@baseline-kit/core` is pure TypeScript (zero dependencies), `@baseline-kit/dom`
  holds imperative observers and timing utilities, `@baseline-kit/react` is the
  React adapter that consumers publish-install as plain `baseline-kit`.
  Types for the top-level `baseline-kit` entry are now bundled flat into
  `dist/index.d.ts` via `rollup-plugin-dts`, so consumers don't see workspace
  paths in their editor.

### Improvements

- Spacer measurement labels (e.g. `"8px"`) are marked `aria-hidden="true"` —
  they're developer annotations, not content screen readers should announce.
- `Baseline` (`.bas`) and `Guide` (`.cols`) overlays get
  `contain: layout style paint`, isolating debug-grid updates from surrounding
  page layout.
- Removed dead `createStyleOverride` calls in Box / Stack / Layout / Baseline
  descriptors where the "override" value was always identical to its default.
  CSS module defaults in `base.css` carry the values the user sees.
- Hydration state consolidated: `Box`, `Spacer`, `Padder` now use a single
  `useIsClient` hook instead of five copies of the `useState` + `useEffect`
  pattern.
- Dropped the dead `warnOnMisalignment` option from `BaselineOptions` (the
  hook had been ignoring it since deprecation).
- Standardised ref typing (`HTMLDivElement | null`) across components.

### Dependencies

- `jsdom` 26 → 29 (test env)
- `rollup-plugin-visualizer` 5 → 7 (dev-only bundle analyzer)
- `typescript` peer range widened to `^5.8.2 || ^6.0.0` so consumers can use
  TS 6; devDep pinned at `^5.9.3` for reproducible builds.
- `eslint` 10 held back — upstream `eslint-plugin-react` 7.37.5 still uses
  APIs removed in ESLint 10. Will revisit when the plugin ships a compatible
  release.
- `eslint-plugin-react-hooks` 7 held back — its new rules flag longstanding
  patterns (`useBaseline` ref-latch, `useIsClient` setState-in-effect) that
  need their own refactor.
- `@types/node` kept on 22 (LTS alignment).

### CI

- Pinned Node to `22` in `test.yml` and `publish.yml` via
  `actions/setup-node@v4` to satisfy engine requirements of the bumped
  `jsdom` and `rollup-plugin-visualizer`.
- `typescript` added to `devDependencies` so CI resolves the same version as
  local development (fresh checkouts were otherwise pulling the peer range's
  latest satisfying version).

### Testing

- 206 tests, up from 174 at the start of the v5 cycle. Coverage added for
  every pure descriptor (`baseline`, `box`, `guide`, `padder`, `spacer`, plus
  pre-existing `stack` regression test), viewport context threading,
  `rafThrottle` cancel, and the `useBaseline` first-measurement snap.

## 3.0.2

### Patch Changes

- More Readme fix

## 3.0.1

### Patch Changes

- Update README

## 3.0.0

### Major Changes

- comprehensive component library redesign with improved theming system and optimized rendering

## 2.1.0

### Minor Changes

- Added comprehensive Server-Side Rendering (SSR) support:
  - Created new SSR utilities for stable rendering between server and client
  - Updated package exports for proper CSS file resolution in SSR environments
  - Added deterministic initial rendering for all components
  - Implemented hydration-aware components that enhance after client-side hydration
  - Added `ssrMode` prop for explicit SSR optimization
  - Improved compatibility with Next.js, Remix, and other React Router applications

## 2.0.2

### Patch Changes

- React 19 compatibility:
  - Replaced useContext with the React 19 `use` hook
  - Updated Context Provider syntax
  - Improved theme system organization and documentation
  - Fixed gitignore and repository organization
  - Updated dependencies

## 2.0.1

### Patch Changes

- 63a10ba: Fix readme, remove the demo and improved layout

## 2.0.0

### Major Changes

- 883f42d: API Refactor and added Stack Layout components

## 1.1.2

### Patch Changes

- type and lint fixing

## 1.1.1

### Patch Changes

- documentation update

## 1.1.0

### Minor Changes

- Added Spacer component

## 1.0.0

### Major Changes

- Removed PaddedGrid Component and update API

### Patch Changes

- 4ec1a23: Refactor the props configurations
