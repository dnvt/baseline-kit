# Examples & Use Cases

## Basic Layout Patterns

### Column-Based Layout

```tsx
import { XGrid } from 'padded-grid';

function ColumnBasedLayout() {
  return (
    <div className="layout">
      <XGrid
        config={{
          columns: ['240px', '1fr'],
          gap: 24,
          maxWidth: "1400px",
        }}
        visibility="visible"
      />
      <div className="content">
        <aside>Sidebar content</aside>
        <main>Main content</main>
      </div>
    </div>
  );
}
```

### Fixed Grid Layout

```tsx
function FixedGridLayout() {
  return (
    <div className="layout">
      <XGrid
        config={{
          columns: 4,
          gap: 24,
          maxWidth: "1200px",
        }}
        visibility="visible"
      />
      <div className="cards">
        {cards.map(card => (
          <div key={card.id} className="card">
            {card.content}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Typography with Baseline Grid

NOTE: Coming soon is padding-stack library, which will help facilitate aligning your text components to the baseline.

```tsx
import { YGrid } from 'padded-grid';

function Article() {
  return (
    <div>
      {/* Show baseline grid for development */}
      <YGrid
        config={{
          baseUnit: 8,
          height: "100%",
        }}
        visibility={process.env.NODE_ENV === 'development' ? 'visible' : 'hidden'}
      />

      <article className="content">
        <h1 style={{ /* padding block to match the baseline */ }}>Article Title</h1>
        <p style={{ /* padding block to match the baseline */ }}>Article content...</p>
      </article>
    </div>
  );
}
```

## Advanced Patterns

### Mixed Column Layout

```tsx
function ComplexLayout() {
  return (
    <div>
      <XGrid
        config={{
          columns: ['64px', '1fr', '2fr', '1fr', '64px'],
          maxWidth: "1600px",
          gap: 16,
        }}
        visibility="visible"
      >
        <div>Left</div>
        <div>Content 1</div>
        <div>Main Content</div>
        <div>Content 2</div>
        <div>Right</div>
      </XGrid>
    </div>
  );
}
```

### Development Grid Overlay

```tsx
function DevelopmentLayout() {
  return (
    <div className="layout">
      {/* Column guides */}
      <XGrid
        config={{
          columns: 12,
          gap: 16,
          color: "#0000ff15"
        }}
        visibility="visible"
      />

      {/* Baseline guides */}
      <YGrid
        config={{
          baseUnit: 8,
          color: "#ff000015"
        }}
        visibility="visible"
      />

      {/* Content */}
      <main>Your content here</main>
    </div>
  );
}
```

See [Grid System Documentation](./GRID_SYSTEM.md) for more details on the underlying concepts and calculations.
