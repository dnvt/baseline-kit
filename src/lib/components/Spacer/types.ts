import { BaseComponentProps, CSSValue } from '@types'
import { GRID } from '@utils'

type SpacerSize = number & {
  __brand: 'MultipleOfBase';
};

export function createSpacerSize(value: number): SpacerSize {
  if (value % GRID.DEFAULTS.BASE !== 0) {
    throw new Error('SpacerSize must be a multiple of the base value')
  }
  return value as SpacerSize
}

interface SpacerConfig {
  base?: number
  height?: CSSValue | SpacerSize
  width?: CSSValue | SpacerSize
}

export interface SpacerProps extends BaseComponentProps {
  config: SpacerConfig
}