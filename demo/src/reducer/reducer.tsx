import type {
  DemoGridState as DemoState,
  DemoGridAction,
} from '../components/types'

export function actions(state: DemoState, action: DemoGridAction): DemoState {
  switch (action.type) {
    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: { ...state.config, ...action.payload },
      }
    case 'TOGGLE_GUIDE':
      return {
        ...state,
        showGuides: {
          ...state.showGuides,
          [action.payload.component]: action.payload.value,
        },
      }
    case 'UPDATE_COLUMN_CONFIG':
      return {
        ...state,
        columnConfig: { ...state.columnConfig, ...action.payload },
      }
    case 'SET_PAGE_HEIGHT':
      return {
        ...state,
        pageHeight: action.payload,
      }
    default:
      return state
  }
}
