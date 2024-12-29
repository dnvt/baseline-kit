# Padded Grid

A development tool for visualizing and maintaining consistent grid systems in React applications. Similar to design
tools like Figma, it provides toggleable grid overlays that help ensure precise spacing and alignment during
development.

## Features

- 🎯 Interactive grid overlays for development
- 📏 Column grid visualization (like Figma's layout grid)
- 📐 Baseline grid for typography alignment
- 🎚️ Toggleable grid visibility
- 🎨 Customizable grid colors and opacity
- 🔧 TypeScript-first with comprehensive types
- ⚡️ Zero runtime dependencies
- 🪶 Tree-shakeable & optimized bundle

## Quick Start

```tsx
import { XGrid, YGrid } from 'padded-grid';
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

      <main>Your content...</main>
    </div>
  );
}
```

## Documentation

- [Grid System Documentation](./docs/GRID_SYSTEM.md) - Core concepts and formulas
- [Component API Reference](./docs/COMPONENTS.md) - Detailed component docs
- [Examples & Use Cases](./docs/EXAMPLES.md) - Common patterns

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid Layout support required
- CSS Custom Properties (CSS Variables) support required

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT © [François Denavaut](https://github.com/dnvt)
