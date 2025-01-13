import type { ComponentsProps } from '@types'
import type { CSSValue, Padding } from '@utils'
import { ReactNode } from 'react'

export type PadderProps = {
  width?: CSSValue | 'fit-content' | 'auto'
  height?: CSSValue | 'fit-content' | 'auto'
  children: ReactNode
} & Padding & ComponentsProps
