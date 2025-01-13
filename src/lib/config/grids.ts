import { COMPONENTS } from './components'

export const X_GRID = {
  align: 'center',
  baseUnit: COMPONENTS.baseUnit,
  color: COMPONENTS.colors.XGrid,
  columns: 9,
  columnWidth: '1fr',
  gap: COMPONENTS.baseUnit,
  variant: COMPONENTS.variants.XGrid,
  maxWidth: '100%',
  padding: 0,
  visibility: COMPONENTS.visibility.XGrid,
  zIndex: COMPONENTS.zIndex,
} as const

export const Y_GRID = {
  baseUnit: COMPONENTS.baseUnit,
  color: COMPONENTS.colors.YGrid,
  height: '100%',
  variant: COMPONENTS.variants.YGrid,
  visibility: COMPONENTS.visibility.YGrid,
  zIndex: COMPONENTS.zIndex,
}