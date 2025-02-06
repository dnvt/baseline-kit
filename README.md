# Baseline Kit

Baseline Kit is a lightweight development tool for visualizing and debugging grid systems and spacing in React
applications. It provides configurable overlays for both column-based and baseline grids, flexible layout components,
and theme-aware configuration—all optimized for performance and built with TypeScript.

![Demo visual](demo/padded-demo.png)

## Features

- 🎯 **Interactive Guide Overlays:** Easily toggle grid overlays (both horizontal and vertical) to ensure precise
  alignment in your layouts.
- 📏 **Dynamic Layout Components:** Flexible components like Layout, Stack, Box, and Padder provide consistent spacing
  and alignment.
- 🧩 **Grid System Components:** New Layout component for CSS Grid-based layouts with automatic column calculations.
- 📐 **Flex Layout Support:** Flex component for flexible box layouts with built-in baseline alignment.
- 🔄 **Responsive Design:** Components automatically adapt to container dimensions and base unit configuration.
- 🎨 **Configurable & Themed:** Leverage the Config component and hooks such as useConfig to easily override default
  settings.

## Installation

```shell
npm install baseline-kit

```

## Quick Start

Below is an example that demonstrates how to integrate Baseline Kit into your React application for both grid overlays
and spacing management:

```tsx
import React from 'react'
import { Config, Guide, Baseline, Box, Spacer } from 'baseline-kit'
import 'baseline-kit/styles.css'

function App() {
  const isDev = process.env.NODE_ENV === 'development'
  const debugMode = isDev ? 'visible' : 'hidden'

  return (
    <Config>
      {/* Baseline Grid for typography alignment */}
      <Baseline config={{ base: 8, height: "100vh" }} debugging={debugMode} />

      {/* Column Grid Overlay */}
      <Guide
        variant="pattern"
        columns={['100px', '200px', '100px']}
        gap={2}
        debugging={debugMode}
        align="center"
        width="1200px"
      />

      {/* Box container that aligns its children to the baseline grid */}
      <Box debugging="visible" block={[16, 16]} inline={8}>
        <h1>Content Aligned to the Grid</h1>
        <p>This box uses a consistent baseline spacing.</p>
      </Box>

      {/* Spacer component for dynamic spacing */}
      <Spacer
        height="16px"
        width="100%"
        config={{ base: 8, color: "#ff0000" }}
        visibility="visible"
      />

      <main>Your main content goes here...</main>
    </Config>
  )
}

export default App
```

## Components & API

### Config

The **Config** component provides a theme context for all Baseline Kit components. It allows you to override default
values such as the base unit, colors, and debugging modes.

#### Usage

```tsx
<Config base={16} guide={{ debugging: 'visible' }}>
  {/* Components that consume the config */}
  <Guide />
  <Baseline />
</Config>
```

All configuration hooks (e.g. useConfig) will pull values from this context.

### Guide

The **Guide** component overlays a vertical grid to help you visualize column-based layouts.

#### Variants

- **line**: Renders evenly spaced vertical lines.
- **pattern**: Uses a custom array of column widths (e.g. ['1fr', '2fr', '1fr']).
- **fixed**: Renders a fixed number of columns.
- **auto**: Automatically calculates columns based on a given column width.

#### Props Example

```tsx
<Guide
  variant="pattern"
  columns={['100px', '200px', '100px']}
  gap={2}
  debugging="visible"
  align="center"
  width="1200px"
/>
```

Internally, the Guide component calculates the CSS grid template, gap, and column count based on container size and the
provided configuration.

### Baseline

The **Baseline** component overlays an horizontal grid for aligning typography and vertical spacing.

#### Props Example

```tsx
<Baseline
  config={{ base: 8, height: "100vh" }}
  debugging="visible"
/>
```

### Box

The **Box** component is a container component that aligns its content to the baseline grid. It leverages both the
useBaseline hook and the global configuration.

#### Props Example

```tsx
<Box debugging="visible" block={[11, 5]}>
  <p>Content aligned to the baseline grid!</p>
</Box>
```

### Padder

The **Padder** component applies consistent spacing (or padding) around its children. In debug mode, it renders visual
indicators for the padding boundaries.

#### Props Example

```tsx
<Padder block={16} inline={8} debugging="visible">
  <p>Inside a padded area.</p>
</Padder>
```

### Spacer

The **Spacer** component provides flexible space between elements. It adjusts its dimensions based on the configured
base unit and can optionally display measurement indicators in debug mode.

#### Props Example

```tsx
<Spacer
  height="16px"
  width="100%"
  config={{ base: 8, color: "#ff0000" }}
  debugging="visible"
/>
```

### Stack

The **Stack** component is a flexible flex container that ensures consistent spacing based on your baseline
configuration. Like the Box and Layout components, it does not rely on DOM measurements and defaults to "fit-content"
for width and height when no values are passed. You can still specify fixed dimensions if needed.

#### Key Features

- **Flex Layout:** Arrange children in a horizontal (default “row”) or vertical (“column”) direction.
- **Default Sizing:** When no width or height is explicitly specified, the Stack component will render with a width and
  height of "fit-content" (similar to Box and Layout).
- **Direct Padding for Debugging:** When the debugging mode is set to `"none"`, the component applies its computed
  baseline padding directly via inline styles.
- **Customizable:** Supports custom class names, inline styles, gap, justification, and alignment properties.

#### Props Example

```tsx
// Without explicit width/height, Stack defaults to "fit-content".
<Stack debugging="visible" block={[16, 16]} inline={8}>
  <p>This content is aligned to the flex container’s baseline.</p>
</Stack>

// You can also force fixed dimensions:
<Stack width="500px" height="300px" direction="column" justify="center" align="center">
  <p>Content</p>
</Stack>
```

Internally, the Stack component uses the baseline configuration (via the ⁠useBaseline hook) to resolve spacing and
alignment, while ignoring any DOM measurements. This makes its behavior consistent with the Box and Layout components.

### Layout

The **Layout** component is designed for CSS Grid-based layouts. It automatically calculates grid templates based on the
provided column definitions, while also managing consistent spacing with baseline configuration. Like the Box and Stack
components, Layout does not rely on DOM measurements and defaults to using "fit-content" for width and height when no
explicit values are provided.

#### Key Features

- **Grid Overlay:** Automatically computes grid templates, whether using fixed columns, patterns, or auto-calculated
  columns.
- **Default Sizing:** If no `width` or `height` is specified, the Layout component defaults to "fit-content", ensuring
  it adapts to its content size.
- **Direct Integration with Padder:** Uses the Padder component internally to handle computed baseline padding and
  spacing.
- **Customizable:** Accepts custom class names, inline styles, gap, and alignment properties.

#### Props Example

```tsx
// Without explicit width/height, Layout defaults to "fit-content".
<Layout
  columns={['100px', '200px', '100px']}
  gap="16px"
  debugging="visible"
>
  <p>Your grid content goes here.</p>
</Layout>

// You can also force fixed dimensions:
<Layout
  columns={3}
  width="1200px"
  height="800px"
  justifyItems="center"
  alignItems="stretch"
>
  <Box span={1}>Content laid out in a CSS Grid.</Box>
</Layout>
```

Internally, Layout leverages the baseline configuration (via the ⁠useBaseline hook) to resolve spacing and alignment,
ensuring that layout behavior is consistent with the rest of the Baseline Kit components.

## Core Concepts

### Grid Calculations

**Baseline Kit** supports various methods of grid calculation:

- **Fixed Columns:** Define a fixed number of equally-sized columns.
- **Pattern Columns:** Use an array of column widths to define a repeating pattern.
- **Auto-Calculated Columns:** Automatically determine the number of columns based on container width and a specified
  column width.
- **Line Variant:** Renders single-pixel lines for precise alignment.

## Debugging Modes

The library supports three debugging modes:

- **visible:** Overlays and debug visuals are fully rendered.
- **hidden:** Debug elements are present but not visible.
- **none:** Debugging is disabled; no extra elements are rendered.

These modes can be toggled via component props or via the global configuration.

## Performance & Compatibility

- **Performance:** All grid calculations and measurements are throttled and optimized using requestAnimationFrame to
  minimize reflows and ensure smooth rendering.
- **Browser Support:** Baseline Kit works in modern browsers (Chrome, Firefox, Safari, Edge) with support for CSS Grid
  Layout and CSS Custom Properties.
- **Tree-Shakeable:** The library is optimized for modern bundlers and supports tree-shaking.

## License

MIT © [François Denavaut](https://github.com/dnvt)
