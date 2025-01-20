import { memo, type CSSProperties, type RefObject } from 'react'
import { useGuideVisibleLines } from '@hooks'
import styles from '../styles.module.css'
import type { GuideVariant } from '../../types'

type Props = {
  count: number
  base: number
  color: string
  containerRef: RefObject<HTMLDivElement | null>
  variant: GuideVariant
}

export const GridRows = memo(function GridRows({
  count,
  base,
  color,
  containerRef,
  variant,
}: Props) {
  const { start, end } = useGuideVisibleLines({
    totalLines: count,
    lineHeight: base,
    containerRef,
  })

  const getRowStyle = (idx: number): CSSProperties => ({
    '--pdd-guide-top': `${idx * base}px`,
    '--pdd-guide-color': color,
    '--pdd-guide-line-stroke': variant === 'line' ? '1px' : `${base}px`,
  })

  return (
    <>
      {Array.from({ length: end - start }, (_, i) => {
        const idx = i + start
        return (
          <div
            key={idx}
            className={styles.row}
            style={getRowStyle(idx)}
            data-row-index={idx}
            data-variant={variant}
          />
        )
      })}
    </>
  )
})
