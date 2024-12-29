import type { CSSProperties } from 'react'
import type {
  GridAlignment,
  CSSValue,
  GridVariant,
  BaseGridStyles,
  GridLineStyles,
  GridColumnsPattern,
  BaseComponentProps,
} from '@types'

export interface XGStyles extends BaseGridStyles {
  '--grid-template-columns': CSSProperties['gridTemplateColumns'];
  '--grid-gap': string | number;
  '--grid-padding': CSSProperties['padding'];
  '--grid-columns': number;
  '--grid-column-color': CSSProperties['color'] | CSSProperties['backgroundColor'];
  '--grid-column-width': GridVariant extends 'line'
    ? GridLineStyles['--grid-column-width']
    : CSSValue;
}

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

export interface XGProps extends BaseComponentProps {
  config: XGConfig;
  visibility?: 'hidden' | 'visible';
  style?: Partial<XGStyles>;
}