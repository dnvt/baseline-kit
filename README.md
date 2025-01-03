# Padded Grid

Padded Grid is a lightweight, debugging / dev-tool library for visualizing and maintaining consistent grid systems in
React applications. Inspired by tools like Figma, it provides powerful, customizable grid overlays and spacing utilities
to ensure precise alignment and spacing during development.

## Features

- 🎯 **Interactive Grid Overlays:** Toggleable grids for development.
- 📏 **Column Grid Visualization:** Perfect for layout alignment.
- 📐 **Baseline Grid Support:** Align typography and spacing.
- 🧩 **Flexible Spacer Component:** Simplify spacing with adjustable dimensions.
- 🎨 **Customizable:** Colors, opacity, and grid configurations.
- ⚡ **Performance Optimized:** Zero runtime dependencies, tree-shakeable, and modern browser support.
- 🔧 **TypeScript-First:** Comprehensive typings for better DX.

## Installation

Install via npm or yarn:

```shell
npm install padded-grid
```

## Quick Start

Add padded-grid to your React project to visualize grids and manage spacing during development:

```tsx
import { XGrid, YGrid, Spacer } from 'padded-grid';
import 'padded-grid/styles.css';

function App() {
  const showGrid = process.env.NODE_ENV === 'development';

  return (
    <div>
      {/* Baseline grid for typography alignment */}
      <YGrid
        config={{
          baseUnit: 8,
          height: "100%",
        }}
        visibility={showGrid ? 'visible' : 'hidden'}
      />

      {/* Column grid overlay */}
      <XGrid
        config={{
          columns: 12,
          gap: 16,
          maxWidth: "1200px",
        }}
        visibility={showGrid ? 'visible' : 'hidden'}
      />

      {/* Spacer for dynamic spacing */}
      <Spacer
        height="16px"
        width="100%"
        config={{
          baseUnit: 8,
          color: "#ff0000",
        }}
        visibility="visible"
      />

      <main>Your content...</main>
    </div>
  );
}
```

---

## Components

### XGrid (Horizontal Grid)

The XGrid component provides column-based grid overlays for layout visualization.

#### Props

```typescript
interface XGConfig {
  columns?: number | GridColumnsPattern; // Fixed number or pattern of columns
  columnWidth?: CSSValue;               // For auto-calculated columns
  gap?: CSSValue;                       // Gap between columns
  align?: 'start' | 'center' | 'end';   // Grid alignment
  color?: CSSProperties['color'];       // Guide color
  maxWidth?: CSSValue;                  // Maximum grid width
  padding?: CSSProperties['padding'];   // Grid padding
  variant?: 'line';                     // Optional line variant
  zIndex?: number;                      // Z-index for grid
}

interface XGProps {
  config: XGConfig;
  visibility?: 'hidden' | 'visible';
  className?: string;
  style?: Partial<XGStyles>;
}
```

#### Examples

```tsx
// Fixed columns
<XGrid
  config={{
    columns: 12,
    gap: 16,
    maxWidth: "1200px",
  }}
  visibility="visible"
/>

// Custom column pattern
<XGrid
  config={{
    columns: ['64px', '1fr', '2fr', '1fr', '64px'],
    gap: 24,
    color: "#0000ff1a",
  }}
  visibility="visible"
/>
```

---

### YGrid (Vertical Grid)

The YGrid component provides baseline grid overlays for typography alignment.

#### Props

```typescript
interface YGConfig {
  baseUnit?: number;                   // Base unit for spacing (default: 8)
  height?: CSSValue;                   // Grid height (default: '100%')
  variant?: 'line' | 'flat';           // Grid style variant (default: "line")
  color?: CSSProperties['color'];      // Guide color
  zIndex?: number;                     // Z-index for layering
}

interface YGProps {
  config: YGConfig;
  visibility?: 'hidden' | 'visible';
  className?: string;
  style?: Partial<YGStyles>;
}
```

#### Examples

```tsx
// Basic baseline grid
<YGrid
  config={{
    baseUnit: 8,
    height: "100%",
  }}
  visibility="visible"
/>

// Custom variant and color
<YGrid
  config={{
    baseUnit: 8,
    variant: "flat",
    color: "rgba(255,0,0,0.1)",
  }}
  visibility="visible"
/>
```

---

### Spacer

The Spacer component provides a flexible way to add spacing in your layouts.
It adjusts its dimensions dynamically and supports optional measurement indicators for development.

Use Spacer to manage dynamic spacing between elements, instead of wrapping your Stacks with useless noisy paddings.

#### Props

```typescript
interface SpacerProps {
  height?: CSSValue;                      // Height of the spacer
  width?: CSSValue;                       // Width of the spacer
  config?: {
    baseUnit?: number;                    // Base unit for spacing (default: 8)
    variant?: 'line';                     // Style variant for the spacer
    color?: CSSProperties['color'];       // Color of the spacer
    zIndex?: number;                      // Z-index for layering
  };
  indicatorNode?: (value: number, dimension: 'width' | 'height') => ReactNode; // Custom indicator renderer
  visibility?: 'hidden' | 'visible';      // Visibility of the spacer
  className?: string;                     // Additional class names
  style?: CSSProperties;                  // Inline styles
}
```

#### Examples

```tsx
// Simple spacer
<Spacer
  height="16px"
  width="100%"
  visibility="visible"
/>

// Spacer with custom configuration
<Spacer
  height="32px"
  config={{
    baseUnit: 8,
    color: "#ff0000",
  }}
  visibility="visible"
/>

// Spacer with measurement indicators
<Spacer
  height="16px"
  indicatorNode={(value, dimension) => (
    <div>{`${dimension}: ${value}px`}</div>
  )}
  visibility="visible"
/>
```

## Core Concepts

### Grid Calculations

#### 1. Fixed Columns:

- Define a fixed number of equally-sized columns.
- Example: columns: 12.

#### 2. Pattern Columns:

- Specify custom column widths.
- Example: columns: ['64px', '1fr', '2fr'].

#### 3. Auto-Calculated Columns:

- Automatically calculate the number of columns based on container width and column width.
- Example: columnWidth: '240px'.

#### 4. Line Variant:

- Single-pixel lines for precise alignment.
- Example: variant: 'line'.

---

## Development Tips

- **Color Usage:** Use low-opacity colors (e.g., rgba(255,0,0,0.1)) for better visibility.
- **Performance:** Toggle grid visibility when not needed to avoid rendering overhead.
- **Multiple Grids:** Combine XGrid, YGrid, and Spacer for comprehensive layout visualization.
- **Debugging:** Use browser dev tools to inspect alignment and spacing.

---

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge).
- Requires CSS Grid Layout and CSS Custom Properties support.

---

## License

MIT © [François Denavaut](https://github.com/dnvt)
