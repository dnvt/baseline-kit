export type CSSValue = string | number | undefined

export type SpacingProps = {
  padding?: PaddingValue;
  block?: Spacing;
  inline?: Spacing;
}

export type Spacing =
  | number
  | [number, number]
  | { start?: number; end?: number };

export type PaddingValue =
  | number
  | [number, number] // [block, inline]
  | [number, number, number, number] // [top, right, bottom, left]
  | {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

export type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
}