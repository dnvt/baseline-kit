# Component API Reference

## XGrid

Horizontal grid component for column-based layouts.

### Props

```typescript
interface XGConfig {
  // Column configuration (one of these required)
  columns?: number | GridColumnsPattern;    // Fixed number or pattern of columns
  columnWidth?: CSSValue;                   // For auto-calculated columns

  // Common properties
  gap?: CSSValue;                          // Gap between columns
  align?: 'start' | 'center' | 'end';      // Grid alignment
  color?: CSSProperties['color'];          // Guide color
  maxWidth?: CSSValue;                     // Maximum grid width
  padding?: CSSProperties['padding'];      // Grid padding
  variant?: 'line';                        // Optional line variant
  zIndex?: number;                         // Z-index for grid
}

interface XGProps {
  config: XGConfig;
  visibility?: 'hidden' | 'visible';
  className?: string;
  style?: Partial<XGStyles>;
}
```

### Usage Examples

```tsx
// Fixed columns
<XGrid
  config={{
    columns: 12,
    gap: 16,
    maxWidth: "1200px"
  }}
  visibility="visible"
/>

// Custom pattern
<XGrid
  config={{
    columns: ['24px', '1fr', '2fr'],
    gap: 16,
    color: '#0000ff25'
  }}
  visibility="visible"
/>

// Line variant
<XGrid
  config={{
    variant: 'line',
    gap: 8,
    color: '#00000020'
  }}
  visibility="visible"
/>

// Auto-calculated columns
<XGrid
  config={{
    columnWidth: 240,
    gap: 24
  }}
  visibility="visible"
/>
```

## YGrid

Vertical grid component for baseline alignment.

### Props

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

### Usage Examples

```tsx
// Basic baseline grid
<YGrid
  config={{
    baseUnit: 8,
    height: "100%"
  }}
  visibility="visible"
/>

// Custom variant and color
<YGrid
  config={{
    baseUnit: 8,
    variant: "flat",
    color: "rgba(255,0,0,0.1)"
  }}
  visibility="visible"
/>
```

## Common Patterns

### Grid with Guides

```tsx
<div>
  <XGrid
    config={{
      columns: 12,
      gap: 16,
      color: "#0000ff15",
    }}
    visibility="visible"
  />

  <YGrid
    config={{
      baseUnit: 8,
      color: "#ff000015",
    }}
    visibility="visible"
  />

  {/* Content */
  }
  <main>Your content here</main>
</div>
```

### Mixed Column Patterns

```tsx
<XGrid
  config={{
    columns: [
      '64px',     // Fixed sidebar
      '1fr',      // Flexible content
      '300px',    // Fixed sidebar
    ],
    gap: 24,
  }}
  visibility="visible"
/>
```