import type { CSSProperties, ReactNode } from 'react'

// CSS Types
export const CSS_UNITS = ['px', 'rem', 'em', 'vh', 'vw', '%', 'fr'] as const
export type CSSUnit = (typeof CSS_UNITS)[number]
export type CSSCompound<T extends number | string> = T | `${number}${CSSUnit}`;

export type CSSValue = CSSCompound<number>;
export type CSSPixelValue = number | `${number}px`

// CSS Custom Properties
export type CSSCustomProperties = Record<`--grid-${string}` | `--stack-${string}` | `--spacer-${string}`, CSSValue>;

// Grid Types
export type GridFrValue = `${number}fr`;
export type GridColumnValue = CSSValue | GridFrValue | 'auto';
export type GridColumnsPattern = readonly GridColumnValue[];

// Grid Constants & Types
export const GRID_ALIGNMENTS = ['start', 'center', 'end'] as const
export type GridAlignment = typeof GRID_ALIGNMENTS[number];

export const GRID_VARIANTS = ['line', 'flat'] as const
export type GridVariant = typeof GRID_VARIANTS[number];

// Common Component Types
export interface ComponentsProps {
  'data-testid'?: string;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties & CSSCustomProperties;
  visibility?: Visibility
}

export type Visibility = 'none' | 'hidden' | 'visible'