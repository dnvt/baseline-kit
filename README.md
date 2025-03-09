# Baseline Kit

![Build Status](https://img.shields.io/github/actions/workflow/status/dnvt/baseline-kit/test.yml)
![npm version](https://img.shields.io/npm/v/baseline-kit)
![License](https://img.shields.io/github/license/dnvt/baseline-kit)

Baseline Kit is a lightweight development tool for visualizing and debugging grid systems and spacing in React 19 applications. It provides configurable overlays for both column-based and baseline grids, flexible layout components, and theme-aware configuration—all optimized for performance and built with TypeScript.

![Demo visual](kit.png)

## Table of Contents
  - [Base Unit](#base-unit)
  - [Spacing Values](#spacing-values)
  - [Grid Snapping](#grid-snapping)
  - [Debugging Modes](#debugging-modes)
  - [Component Hierarchy](#component-hierarchy)
  - [Key Components](#key-components)
    - [Config](#config)
    - [Baseline](#baseline)
    - [Guide](#guide)
    - [Box](#box)
  - [CSS Import Options](#css-import-options)
  - [Theme Options](#theme-options)
  - [Theme Variables Reference](#theme-variables-reference)
  - [SSR-Friendly Design](#ssr-friendly-design)
  - [SSR Mode Prop](#ssr-mode-prop)

## Features

- 📏 **Baseline Grid:** Core system for maintaining vertical rhythm and consistent spacing across your layouts
- 🎯 **Column Grid Guide:** Customizable overlay system for visualizing column-based layouts and alignment
- 📦 **Box Component:** Basic container with configurable spacing that snaps to the baseline grid
- 🧩 **Layout Component:** CSS Grid-based container with automatic column calculations and baseline alignment
- 📐 **Stack Component:** Flex-based container that maintains consistent spacing and baseline alignment
- 🎨 **Theme System:** Customizable colors and debug visuals through a centralized configuration

## Requirements

- **React 19**: Baseline Kit is built for React 19 and uses the latest React features like the `use` hook
- **Modern Browsers**: Supporting the latest CSS features

## Installation

```shell
# Using npm
npm install baseline-kit

# Using yarn
yarn add baseline-kit

# Using pnpm
pnpm add baseline-kit
```

After installation, import both the styles and theme in your application:

```tsx
// Import in your main entry file (e.g., index.js, App.js)
import 'baseline-kit/styles';  // Required core styles
import 'baseline-kit/theme';   // Recommended theme (or use your own)
```

For frameworks like Remix that use URL imports in a links function:

```tsx
export const links = () => [
  { rel: "stylesheet", href: "baseline-kit/styles" },
  { rel: "stylesheet", href: "baseline-kit/theme" }
];
```

If you prefer a single CSS file that includes everything:

```tsx
// Alternative: Import everything in one file
import 'baseline-kit/full';

// For Remix:
export const links = () => [
  { rel: "stylesheet", href: "baseline-kit/full" }
];
```

Baseline Kit is written in TypeScript and includes built-in type definitions—no additional packages required.

## Quick Start

```tsx
import React from 'react'
import { Config, Guide, Baseline, Box } from 'baseline-kit'

function App() {
  const isDev = process.env.NODE_ENV === 'development'
  const debugging = isDev ? 'visible' : 'hidden'

  return (
    <Config
      base={8}
      baseline={{ debugging }}
      box={{ debugging }}
      guide={{ debugging }}
      spacer={{ debugging }}
    >
      {/* Baseline Grid for typography alignment */}
      <Baseline
        height="100vh"
        debugging="visible"
      />

      {/* Column Grid Guide */}
      <Guide
        variant="pattern"
        columns={['100px', '200px', '100px']}
        gap={16}
        align="center"
        width="1200px"
      />

      {/* Box with baseline alignment */}
      <Box
        block={[2, 5]}
        debugging="visible"
      >
        <h1>Content Aligned to the Grid</h1>
      </Box>

      <main>Your main content goes here...</main>
    </Config>
  )
}
```

## Core Concepts

### Base Unit

The base unit is the foundation of Baseline Kit's spacing system. All measurements are calculated as multiples of this
unit:

```tsx
<Config base={8}>     // Sets 8px as the base unit
  <Layout
    block={17}        // Will be rounded to 16px (2 * base)
    inline={22}       // Will be rounded to 24px (3 * base)
  >
    {/* Content automatically aligned to the 8px grid */}
  </Layout>
</Config>
```

### Spacing Values

Spacing props (`block`, `inline`, `gap`) accept values in three formats:

```
// Single number (applies to both sides)
block={16}                  // 16px top and bottom

// Array [start, end]
block={[2, 3]}                // 2px top, 3px bottom

// Object with explicit values
block={{ start: 2, end: 3 }}  // Same as above
```

### Grid Snapping

Components automatically adjust their spacing to maintain baseline grid alignment:

- **Box**: Adjusts bottom padding to ensure total height aligns with base unit
- **Stack**: Maintains baseline alignment in flex layouts
- **Layout**: Ensures grid cells align with baseline

### Debugging Modes

Three modes are available for development and testing:

```tsx
debugging = "visible"        // Shows all grid lines and measurements
debugging = "hidden"         // Elements exist but are invisible
debugging = "none"           // Removes debug elements entirely
```

## Components

### Component Hierarchy

#### 1. Core Components

- **`Box`** Basic container for text alignment
- **`Stack`** Flex-based layouts (one-dimensional)
- **`Layout`** Grid-based layouts (two-dimensional)

#### 2. Development Tools

- **`Baseline`** Horizontal grid overlay
- **`Guide`** Vertical grid overlay
- **`Spacer`** Precise spacing measurement

#### 3. Configuration

- **`Config`** Theme and settings provider

### Key Components

#### Config

```tsx
<Config
  base={8}                         // Base unit for calculations
  baseline={{ debugging }}         // Baseline grid visibility
  guide={{ debugging }}            // Guide customization
>
  {children}
</Config>
```

#### Baseline

```tsx
<Baseline
  height="100vh"          // Overlay height
  variant="line"          // "line" or "flat"
  debugging="visible"     // Show the grid overlay
/>
```

#### Guide

```tsx
<Guide
  variant="pattern"                     // "line", "pattern", "fixed", or "auto"
  columns={['100px', '1fr', '100px']}   // Column definition
  gap={8}                               // Gap value
  width="1200px"                        // Container width
/>
```

#### Box

```tsx
<Box
  block={[2, 5]}         // Vertical padding in base units
  span={2}               // Grid column span when used in Layout
  snapping="height"      // "none", "height", or "clamp"
>
  <p>Content aligned to baseline grid</p>
</Box>
```

## Theme System

Baseline Kit comes with a flexible CSS structure and theming system:

1. `core.css` - Contains the core component styles required for functionality (imported via `baseline-kit/styles`)
2. `theme.css` - Contains color variables and theming with automatic dark mode support (imported via `baseline-kit/theme`)
3. `baseline-kit.css` - Combined file with both core and theme styles (imported via `baseline-kit/full`)

### CSS Import Options

Baseline Kit gives you flexibility in how you include the styles:

```tsx
// Option 1: Import core styles and theme separately (recommended)
import 'baseline-kit/styles';
import 'baseline-kit/theme';

// Option 2: Import everything in one file
import 'baseline-kit/full';
```

### Theme Options

You now have four options for using the theme system:

#### 1. Use the Built-in Theme (with automatic dark mode)

```tsx
import 'baseline-kit/theme';  // Default theme with light/dark mode support
```

#### 2. Use Specific Theme Variants

```tsx
// Use only the light theme (no dark mode)
import 'baseline-kit/theme/default';

// Use only the dark theme
import 'baseline-kit/theme/dark';

// Example: Apply dark theme regardless of system preference
import 'baseline-kit/styles';
import 'baseline-kit/theme/dark';
```

#### 3. Create a Custom Theme

You can use the tokens template as a starting point:

```tsx
// First check the token template to see available variables
import 'baseline-kit/theme/tokens';  // Just for reference (contains no values)
```

Then create your own custom theme file:

```css
/* yourCustomTheme.css */
:root {
  /* Component-specific colors */
  --bk-baseline-color-line-theme: hsla(210, 100%, 50%, 0.15);
  --bk-baseline-color-flat-theme: hsla(270, 100%, 60%, 0.2);
  /* Add other component colors as needed */
}

/* Optional dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --bk-baseline-color-line-theme: hsla(210, 100%, 50%, 0.2);
  }
}
```

Then import your custom theme:

```tsx
import 'baseline-kit/styles';            // Required core styles
import './path/to/yourCustomTheme.css';  // Your custom theme
```

#### 4. Override via Config

For minor adjustments, use the Config component:

```tsx
<Config
  baseline={{
    colors: {
      line: 'rgba(255,0,0,0.1)',   // Custom red baseline lines
      flat: 'rgba(255,0,0,0.05)',  // Custom red baseline backgrounds
    }
  }}
>
  {/* Your components here */}
</Config>
```

### Theme Variables Reference

| Component | Variable Pattern | Purpose |
|-----------|-----------------|---------|
| Baseline  | `--bk-baseline-color-[line/flat]-theme` | Colors for lines and backgrounds |
| Guide     | `--bk-guide-color-[line/pattern/auto/fixed]-theme` | Colors for different guide variants |
| Box       | `--bk-box-color-[line/flat/text]-theme` | Colors for borders, backgrounds and text |
| Stack     | `--bk-stack-color-[line/flat/text]-theme` | Colors for borders, backgrounds and text |
| Layout    | `--bk-layout-color-[line/flat/text]-theme` | Colors for borders, backgrounds and text |
| Spacer    | `--bk-spacer-color-[line/flat/text]-theme` | Colors for borders, backgrounds and text |

See the [tokens file](https://github.com/dnvt/baseline-kit/blob/main/dist/theme/tokens.css) for a complete list of available variables.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires CSS Grid Layout support and CSS Custom Properties
- Falls back gracefully in unsupported browsers

## React 19 Features

Baseline Kit leverages React 19's latest features:
- **`use` Hook**: Replaces `useContext` for better performance and cleaner code
- **Streamlined Context API**: Uses the simplified Context Provider syntax
- **JSX Transform**: Takes advantage of the mandatory JSX transform in React 19

These modern features allow for cleaner code and better performance, but require React 19.

## Server-Side Rendering (SSR)

Baseline Kit is fully compatible with React's Server-Side Rendering in frameworks like Next.js, Remix, and other React Router-based applications.

### SSR-Friendly Design

Components are designed to:
- Provide consistent rendering between server and client
- Avoid hydration mismatches by using deterministic initial values
- Progressively enhance with client-side measurements after hydration
- Work with frameworks that use streaming SSR

### SSR Mode Prop

Components accept an `ssrMode` prop to explicitly optimize for server rendering:

```tsx
<Baseline
  height="100vh"
  ssrMode={true}
  debugging="visible"
/>
```

With `ssrMode` enabled, components use simplified rendering during SSR and initial hydration, then enhance with full features after client-side hydration completes.

## Development

```shell
# Clone the repository
git clone https://github.com/dnvt/baseline-kit.git

# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test
```

## Performance Features

- Virtualizes large grid overlays
- Client-side only rendering for dynamic components
- Optimized resize event handling
- Optimizes re-renders using React.memo and useMemo
- Supports tree-shaking for minimal bundle size

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## License

MIT © [François Denavaut](https://github.com/dnvt)
