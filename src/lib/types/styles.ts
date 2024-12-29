import type { CSSValue } from './common'
import type { CSSProperties } from 'react'

// CSS Custom Properties
export type CSSCustomProperties = {
  [key: `--grid-${string}`]: CSSValue;
};

// Base Grid Styles
export interface BaseGridStyles
  extends Partial<CSSProperties & CSSCustomProperties> {
  '--grid-base'?: `${number}px`;
  '--grid-max-width'?: CSSValue;
  '--grid-z-index'?: CSSProperties['zIndex'];
  '--grid-justify'?: string;
}

// Grid Variant Styles
export interface GridLineStyles {
  '--grid-column-width': '1px';
  '--grid-row-height': '1px';
}

export interface GridFlatStyles {
  '--grid-column-width': CSSValue;
  '--grid-row-height': CSSValue;
  '--grid-row-opacity': '0' | '1';
}
