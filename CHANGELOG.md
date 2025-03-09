# baseline-kit

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
