import { cx } from '@utils'
import { SpacerDimension } from '@components'

export function Indice(value: number, measurement: SpacerDimension) {
  return <div className={cx('indice', measurement)}>
    {value}
  </div>
}