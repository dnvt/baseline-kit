# Baseline Kit

Baseline Kit is a lightweight development tool for visualizing and debugging grid systems and spacing in React
applications. It provides configurable overlays for both column-based and baseline grids, flexible layout components,
and theme-aware configuration—all optimized for performance and built with TypeScript.

![Demo visual](kit.png)

## Features

- 📏 **Baseline Grid:** Core system for maintaining vertical rhythm and consistent spacing across your layouts
- 🎯 **Column Grid Guide:** Customizable overlay system for visualizing column-based layouts and alignment
- 📦 **Box Component:** Basic container with configurable spacing that snaps to the baseline grid
- 🧩 **Layout Component:** CSS Grid-based container with automatic column calculations and baseline alignment
- 📐 **Stack Component:** Flex-based container that maintains consistent spacing and baseline alignment
- 🎨 **Theme System:** Customizable colors and debug visuals through a centralized configuration

## Installation

```shell
# Using npm
npm install baseline-kit

# Using yarn
yarn add baseline-kit

# Using pnpm
pnpm add baseline-kit
```

### TypeScript Support

Baseline Kit is written in TypeScript and includes built-in type definitions. No additional packages are required.

## Quick Start

Basic setup with debugging enabled during development:

```tsx
import React from 'react'
import { Config, Guide, Baseline, Box } from 'baseline-kit'
import 'baseline-kit/styles.css'

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
<Config base={8}> // Sets 8px as the base unit
  <Layout
    block={17}        // Will be rounded to 16px (2 * base)
    inline={22}       // Will be rounded to 24px (3 * base)
  >
    {/* Content automatically aligned to the 8px grid */}
  </Layout>

  <Stack
    block={[17, 25]}  // Top: 16px, Bottom: 24px
    inline={22}       // Left/Right: 24px
  >
    {/* Padding automatically adjusted to base unit multiples */}
  </Stack>
</Config>
```

### Spacing Values

Spacing props (`block`, `inline`, `gap`) accept values in three formats:

```
// Single number (applies to both sides)
block={16px}                  // 16px top and bottom

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
- **`Padder`** Internal spacing utility

### Config

The Config component provides theme and debugging settings to all child components.

```tsx
<Config
  base={8}                         // Base unit for calculations
  baseline={{ debugging }}         // Baseline grid visibility
  guide={{                         // Guide customization
    debugging,
    colors: {
      line: 'rgba(0,0,255,0.1)'
    }
  }}
>
  {children}
</Config>
```

### Baseline

```tsx
<Baseline
  base={8}                // Base unit (defaults to Config value)
  height="100vh"          // Overlay height
  variant="line"          // "line" or "flat"
  debugging="visible"     // Show the grid overlay
/>
```

### Guide

```tsx
<Guide
  variant="pattern"                          // "line", "pattern", "fixed", or "auto"
  columns={['100px', '1fr', '100px']}        // Column definition
  gap={8}                                    // Gap value
  align="center"                             // "start", "center", or "end"
  width="1200px"                             // Container width
  debugging="visible"                        // Show grid overlay
/>
```

### Box

```tsx
<Box
  block={[2, 5]}         // Vertical padding in base units (auto-adjusted for baseline)
  span={2}               // Grid column span when used in Layout
  snapping="height"      // "none", "height", or "clamp"
  debugging="visible"    // Show alignment guides
>
  <p>Content aligned to baseline grid</p>
</Box>
```

### Stack

```tsx
<Stack
  direction="column"     // "row" or "column"
  block={[8, 24]}        // Vertical padding (auto-snapping)
  inline={16}            // Horizontal padding (auto-snapping)
  gap={16}               // Gap value
  justify="center"       // Flex justify-content
  align="center"         // Flex align-items
  debugging="visible"    // Show alignment guides
>
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</Stack>
```

### Layout

```tsx
<Layout
  columns={3}            // Number of columns or pattern array
  gap={16}               // Gap value
  block={16}             // Vertical padding (auto-snapping)
  inline={8}             // Horizontal padding (auto-snapping)
  debugging="visible"    // Show grid guides
>
  <Box span={2}>Wide content</Box>
  <Box>Regular content</Box>
</Layout>
```

## Theme System

### Color Customization

The theme system allows customization of debugging visuals through the Config component:

```tsx
<Config
  base={8}
  guide={{
    colors: {
      line: 'rgba(0,0,255,0.1)',
      pattern: 'rgba(0,0,255,0.05)',
      auto: 'rgba(0,0,255,0.05)',
      fixed: 'rgba(0,0,255,0.05)'
    }
  }}
  baseline={{
    colors: {
      line: 'rgba(255,0,0,0.1)',
      flat: 'rgba(255,0,0,0.05)'
    }
  }}
>
  {children}
</Config>
```

The library uses CSS custom properties for colors, which automatically respect the user's system dark mode preferences
through CSS media queries. No additional configuration is required.

## Development Setup

```shell
# Clone the repository
git clone https://github.com/dnvt/baseline-kit.git

# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Build package
bun run build
```

## Server-Side Rendering

Baseline Kit is compatible with SSR frameworks like Next.js and Gatsby. The overlay components automatically handle
hydration mismatches.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires CSS Grid Layout support
- Requires CSS Custom Properties (CSS Variables)
- Falls back gracefully in unsupported browsers

## Performance Considerations

- Uses requestAnimationFrame for smooth animations
- Virtualizes large grid overlays
- Optimizes re-renders using React.memo
- Supports tree-shaking for minimal bundle size

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on:

- Development setup
- Code style
- Testing requirements
- Pull request process

## License

MIT © [François Denavaut](https://github.com/dnvt)