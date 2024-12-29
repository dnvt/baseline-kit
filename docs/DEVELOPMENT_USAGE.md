# Development Usage Guide

## Overview

The grid system helps developers visualize and maintain consistent layouts during development, similar to design tools
like Figma.

## Basic Setup

```tsx
import { XGrid, YGrid } from 'padded-grid';
import 'padded-grid/styles.css';

function App() {
  const showGrid = process.env.NODE_ENV === 'development';

  return (
    <div className="layout">
      <XGrid
        config={{
          columns: 12,
          gap: 16,
          maxWidth: "1200px"
        }}
        visibility={showGrid ? 'visible' : 'hidden'}
      />
      <YGrid
        config={{
          baseUnit: 8,
          height: "100%"
        }}
        visibility={showGrid ? 'visible' : 'hidden'}
      />
      <main>Content</main>
    </div>
  );
}
```

## Grid Types

### Column Grid (XGrid)

```tsx
// Fixed columns
<XGrid
  config={{
    columns: 12,
    gap: 16,
    color: "#ff00001a"
  }}
  visibility="visible"
/>

// Custom pattern
<XGrid
  config={{
    columns: ['64px', '1fr', '2fr', '1fr', '64px'],
    gap: 24,
    color: "#0000ff1a"
  }}
  visibility="visible"
/>

// Line variant
<XGrid
  config={{
    variant: 'line',
    gap: 8,
    color: "#00000020"
  }}
  visibility="visible"
/>
```

### Baseline Grid (YGrid)

```tsx
<YGrid
  config={{
    baseUnit: 8,
    color: "#00ff001a",
    variant: "line"
  }}
  visibility="visible"
/>
```

## Development Controls

```tsx
function DevelopmentGrid() {
  const [showGrid, setShowGrid] = useState(true);

  return (
    <div className="layout">
      <XGrid
        config={{
          columns: 12,
          gap: 16,
          maxWidth: "1200px"
        }}
        visibility={showGrid ? 'visible' : 'hidden'}
      />

      <div className="grid-controls">
        <label>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
          />
          Show Grid
        </label>
      </div>

      <main>Content</main>
    </div>
  );
}
```

## Tips & Best Practices

1. **Color Usage**

- Use low-opacity colors (e.g., rgba(255,0,0,0.1))
- Different colors for different grid purposes
- Consider contrast with content

2. **Performance**

- Toggle visibility when not needed
- Use appropriate column counts
- Consider virtualization for long pages

3. **Multiple Grids**

- Layer grids for different purposes
- Use distinct colors for clarity
- Consider z-index ordering

4. **Debugging**

- Toggle grids individually
- Use with browser dev tools
- Check alignment at different widths

## Related Documentation

- [Grid System Documentation](./GRID_SYSTEM.md) - Core concepts and formulas
- [Component API Reference](./COMPONENTS.md) - Detailed component docs
- [Examples & Use Cases](./EXAMPLES.md) - Common patterns