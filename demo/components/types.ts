import type { GridColumnsPattern } from '@types'

interface PGConfig {
  baseUnit: number;
  zIndex: number;
}

export interface DemoGridState {
  config: Partial<PGConfig>
  showGuides: {
    columns: boolean
    baseline: boolean
  }
  columnConfig: {
    count: number
    gap: number
    pattern: GridColumnsPattern
  }
  pageHeight: number
}

export type DemoGridAction =
  | { type: 'UPDATE_CONFIG'; payload: Partial<PGConfig> }
  | { type: 'SET_PAGE_HEIGHT'; payload: number }
  | { type: 'TOGGLE_GUIDE'; payload: { type: 'columns' | 'baseline'; value: boolean } }
  | { type: 'UPDATE_COLUMN_CONFIG'; payload: Partial<DemoGridState['columnConfig']> }