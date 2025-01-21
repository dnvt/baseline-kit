import { CSSProperties, memo } from 'react'
import styles from '../styles.module.css'
import type { GuideVariant } from '../../types'

type Props = {
  count: number
  variant: GuideVariant
  colors: Record<GuideVariant, string>
}

export const GridColumns = memo(function GridColumns({
  count,
  variant,
  colors,
}: Props) {
    
  return (
    <div
      className={styles['columns-container']}
      data-variant={variant}
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={styles.column}
          data-column-index={i}
          data-variant={variant}
          style={{
            backgroundColor: colors[variant],
          } as CSSProperties}
        />
      ))}
    </div>
  )
})
