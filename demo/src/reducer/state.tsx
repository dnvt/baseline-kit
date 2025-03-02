import { DEFAULT_CONFIG, GuideColumnsPattern } from '../../dist'
import type { DemoGridState as DemoState } from '../components/types'

const DEFAULT_COLUMN_COUNT = 9
const DEFAULT_COLUMN_GAP = 8
const DEFAULT_COLUMN_PATTERN: GuideColumnsPattern = [
  '24px',
  '24px',
  '48px',
  '128px',
  '1fr',
  '128px',
  '48px',
  '24px',
  '24px',
]

export const STATE: DemoState = {
  config: {
    base: DEFAULT_CONFIG.base,
  },
  showGuides: {
    baseline: true,
    guides: true,
    padder: true,
    spacer: true,
    box: true,
    stack: true,
    layout: true,
  },
  columnConfig: {
    count: DEFAULT_COLUMN_COUNT,
    gap: DEFAULT_COLUMN_GAP,
    pattern: DEFAULT_COLUMN_PATTERN,
  },
  pageHeight: 0,
}
