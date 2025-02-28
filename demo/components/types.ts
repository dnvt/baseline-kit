import { GuideColumnsPattern } from '@components'

export type VisibilityState = {
  baseline: boolean
  guides: boolean
  padder: boolean
  spacer: boolean
  box: boolean
  stack: boolean
  layout: boolean
}

export type DemoGridState = {
  config: {
    base: number
  }
  showGuides: VisibilityState
  columnConfig: {
    count: number
    gap: number
    pattern: GuideColumnsPattern
  }
  pageHeight: number
}

export type DemoGridAction =
  | { type: 'UPDATE_CONFIG'; payload: Partial<DemoGridState['config']> }
  | { type: 'TOGGLE_GUIDE'; payload: { component: keyof VisibilityState; value: boolean } }
  | { type: 'UPDATE_COLUMN_CONFIG'; payload: Partial<DemoGridState['columnConfig']> }
  | { type: 'SET_PAGE_HEIGHT'; payload: number }
