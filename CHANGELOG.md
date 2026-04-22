# baseline-kit

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
  spacing. *(This fix landed before the `Stack` component was retired; it
  matters now for any code still using `createStackDescriptor` from the core
  package up to 5.0.0 — though that descriptor itself has also been removed.)*
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
