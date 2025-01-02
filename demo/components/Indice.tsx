import { cx } from '@utils'
import { SpacerDimension } from '@/components/Spacer/types'

export function Indice(value: number, measurement: SpacerDimension) {
  return <div className={cx('indice', measurement)}>
    {value}
  </div>
}