import type { CSSProperties } from 'react'
import type {
  GridAlignment,
  CSSValue,
  GridVariant,
  GridColumnsPattern,
  BaseComponentProps,
} from '@types'

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
}