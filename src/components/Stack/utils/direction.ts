import * as React from 'react'

/** Maps shorthand directions to Flexbox directions */
export const DIRECTION_AXIS: Record<string, React.CSSProperties['WebkitFlexDirection']> = {
  x: 'row',
  y: 'column',
  '-x': 'row-reverse',
  '-y': 'column-reverse',
}

export type CSSPropertiesDirectionalAxis = keyof typeof DIRECTION_AXIS;