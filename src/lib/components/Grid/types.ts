import type { CSSProperties } from 'react'
import type {
  ComponentsProps,
  CSSValue,
  GridAlignment,
  GridColumnsPattern,
  GridVariant,
} from '@types'

// XGrid types -----------------------------------------------------------------

interface XGBaseConfig {
  align?: GridAlignment;
  color?: CSSProperties['color'] | CSSProperties['backgroundColor'];
  gap?: CSSValue;
  maxWidth?: CSSValue;
  padding?: CSSProperties['padding'];
  zIndex?: CSSProperties['zIndex'];
}

export interface XGPatternConfig extends XGBaseConfig {
  variant?: never;
  columns: GridColumnsPattern;
  columnWidth?: never;
}

export interface XGAutoConfig extends XGBaseConfig {
  variant?: never;
  columnWidth: CSSValue;
  columns?: never;
}

export interface XGFixedConfig extends XGBaseConfig {
  variant?: never;
  columns: number;
  columnWidth?: CSSValue;
}

export interface XGLineConfig extends XGBaseConfig {
  variant: GridVariant;
  columns?: never;
  columnWidth?: never;
}

export type XGConfig =
  | XGPatternConfig
  | XGAutoConfig
  | XGFixedConfig
  | XGLineConfig;

export interface XGProps extends ComponentsProps {
  config: XGConfig;
}

// YGrid types -----------------------------------------------------------------

export interface GridLineStyles {
  '--grid-column-width': '1px';
  '--grid-row-height': '1px';
}

export interface GridFlatStyles {
  '--grid-column-width': CSSValue;
  '--grid-row-height': CSSValue;
  '--grid-row-opacity': '0' | '1';
}

export interface YGConfig {
  variant?: GridVariant
  color?: CSSProperties['color'] | CSSProperties['backgroundColor']
  height?: CSSProperties['height']
  baseUnit?: number
  zIndex?: CSSProperties['zIndex']
}

export interface YGProps extends ComponentsProps {
  config: YGConfig
}
