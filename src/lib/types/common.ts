import type { CSSProperties, ReactNode } from 'react'
import { CSSCustomProperties } from '@/types/styles'

// CSS Types
export type CSSUnit = 'px' | 'rem' | 'em' | '%' | 'fr' | 'vh' | 'vw';
export type CSSCompound<T extends number | string> = T | `${number}${CSSUnit}`;
export type CSSValue = CSSCompound<number | string>;

// Grid Types
export type GridFrValue = `${number}fr`;
export type GridColumnValue = CSSValue | GridFrValue | 'auto';
export type GridColumnsPattern = readonly GridColumnValue[];

// Grid Constants & Types
export const GRID_ALIGNMENTS = ['start', 'center', 'end'] as const
export type GridAlignment = typeof GRID_ALIGNMENTS[number];

export const GRID_VARIANTS = ['line', 'flat'] as const
export type GridVariant = typeof GRID_VARIANTS[number];

// Base Component Types
export interface BaseComponentProps {
  'data-testid'?: string;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties & CSSCustomProperties;
  visibility?: Visibility
}

export type Visibility = 'none' | 'hidden' | 'visible'