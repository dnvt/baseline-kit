/**
 * @baseline-kit/core - Pure type definitions
 * Framework-agnostic types for the baseline-kit system
 */

// Spacing Types
export type Spacing =
  number | [number, number] | { start?: number; end?: number }

export type PaddingValue =
  | number
  | [number, number]
  | [number, number, number]
  | [number, number, number, number]
  | { top?: number; bottom?: number; left?: number; right?: number }

export type Padding = {
  top: number
  right: number
  bottom: number
  left: number
}

export type SpacingProps = {
  padding?: PaddingValue
  block?: Spacing
  inline?: Spacing
}

// Grid Types
export type GuideVariant = 'line' | 'pattern' | 'fixed' | 'auto'
export type GuideColumnValue = string | number | undefined | 'auto'
export type GuideColumnsPattern = readonly GuideColumnValue[]

// Component Types
export type Variant = 'line' | 'flat' | 'pattern'
export type BaselineVariant = Exclude<Variant, 'pattern'>
export type SnappingMode = 'none' | 'height' | 'clamp'
export type SnapEdge = 'top' | 'bottom'
export type DebuggingMode = 'none' | 'hidden' | 'visible'

/** Hosts a Box can render as instead of a div. Phrasing hosts wrap in spans. */
export type BoxElement =
  | 'div'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'label'
  | 'legend'
  | 'p'
  | 'small'
  | 'span'
  | 'strong'

// Component options shared by the React and Remix entries. Each entry adds
// its own children, className, style, and DOM attribute types.

type SizeOptions = {
  width?: number | string
  height?: number | string
  debugging?: DebuggingMode
  /** Render the server markup only, without measuring in the browser. */
  ssrMode?: boolean
}

export type BaselineOptions = SizeOptions &
  SpacingProps & {
    variant?: BaselineVariant
    base?: number
    color?: string
  }

export type BoxOptions = SizeOptions &
  SpacingProps & {
    /** Render the measured Box as a native semantic host instead of a div. */
    as?: BoxElement
    /** The labelled control id when `as="label"`. */
    htmlFor?: string
    colSpan?: number
    rowSpan?: number
    span?: number
    snapping?: SnappingMode
    snapEdge?: SnapEdge
  }

export type GuideOptions = SizeOptions & {
  align?: 'start' | 'center' | 'end' | 'space-between' | (string & {})
  variant?: GuideVariant
  columns?: number | GuideColumnsPattern
  columnWidth?: number | string
  maxWidth?: number | string
  color?: string
  gap?: number
}

export type PadderOptions = SizeOptions & SpacingProps

export type SpacerOptions = SizeOptions & {
  variant?: Variant
  color?: string
  base?: number
}

// Guide Config Types (framework-agnostic)
type BaseGuideConfig = {
  gap?: number | string
  base?: number
}

export type PatternConfig = BaseGuideConfig & {
  variant: 'pattern'
  columns: GuideColumnsPattern
  columnWidth?: never
}

export type FixedConfig = BaseGuideConfig & {
  variant: 'fixed'
  columns: number
  columnWidth?: number | string
}

export type AutoConfig = BaseGuideConfig & {
  variant: 'auto'
  columnWidth: number | string
  columns?: never
}

export type LineConfig = BaseGuideConfig & {
  variant?: 'line'
  columns?: never
  columnWidth?: never
}

export type GuideConfig = PatternConfig | AutoConfig | FixedConfig | LineConfig
