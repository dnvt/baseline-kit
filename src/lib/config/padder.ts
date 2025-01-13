import { PadderConfig } from '@/components/Padder/types'

export const PADDER: Required<PadderConfig> = {
  variant: 'flat',
  baseUnit: 1,
  color: 'var(--padder-color-flat)',
  zIndex: 'var(--padder-z-index)',
} as const