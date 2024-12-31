import { ComponentsProps, CSSPixelValue } from '@types'
import { ReactNode } from 'react'

type ExclusiveProps<T, K extends keyof T> = {
  [P in K]: (
    { [Q in P]: T[Q] } &
    { [Q in Exclude<K, P>]?: undefined } &
    Omit<T, K>
    )
}[K]

export type Measurement = 'none' | 'width' | 'height'

export type SpacerConfig = {
  baseUnit?: number
  color?: string
  zIndex?: number
  variant?: 'line' | 'flat'
}

export type SpacerProps = ExclusiveProps<{
  config?: SpacerConfig
  height?: CSSPixelValue
  width?: CSSPixelValue
  measureRenderer?: ((value: number, measurement: Measurement) => ReactNode)
}, 'height' | 'width'> & ComponentsProps
