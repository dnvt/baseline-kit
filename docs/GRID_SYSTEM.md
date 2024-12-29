# Grid System Documentation

## Grid Calculation Formulas

### Column Width Calculations

The grid system supports four main calculation modes:

#### 1. Line Variant

```typescript
// Single pixel columns with adjusted gap
columns = Math.max(1, Math.floor(width / (gap + 1)) + 1)
gridTemplateColumns = `repeat(${columns}, 1px)`
```

#### 2. Fixed Columns

```typescript
// For n columns of equal width
gridTemplateColumns = `repeat(${numberOfColumns}, ${columnWidth || '1fr'})`
```

#### 3. Pattern Columns

```typescript
// For custom-defined column widths
// Example: ['24px', '1fr', '2fr', '1fr', '24px']
gridTemplateColumns = columns.join(' ')
```

#### 4. Auto-calculated Columns

```typescript
// Based on specified column width and container width
columns = Math.max(1, Math.floor((width + gap) / (columnWidth + gap)))
gridTemplateColumns = `repeat(${columns}, ${columnWidth})`
```

## Grid Variants

### 1. XGrid (Horizontal Grid)

**Variants:**

- Fixed Columns: Equal width columns with specified count
- Pattern Columns: Custom-defined column widths
- Line Variant: Single-pixel guide lines
- Auto Columns: Width-based column calculation

**Use Cases:**

- Layout visualization
- Column alignment
- Space distribution
- Content grid guides

### 2. YGrid (Baseline Grid)

**Variants:**

- Line: Single pixel lines for precise alignment
- Flat: Block-based spacing visualization

**Use Cases:**

- Typography alignment
- Vertical rhythm
- Content spacing guides

## Limitations & Edge Cases

#### 1. Column Width Considerations

- Minimum practical column width: 1px
- Use appropriate units (px, fr, %, etc.)
- Consider gap impact on layout

#### 2. Performance Optimization

- Large number of columns may impact performance
- YGrid uses virtualization for efficiency
- Consider visibility toggling for complex layouts

#### 3. Browser Requirements

- CSS Grid Layout support required
- CSS Custom Properties support required
- Modern browser features utilized

#### 4. Known Edge Cases

- Container width affects auto-calculation
- Gap adjustments in line variant
- Pattern column validation requirements
