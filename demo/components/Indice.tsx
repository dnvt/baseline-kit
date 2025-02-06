import { mergeClasses } from '@utils'
import { SpacerDimension } from '@components'

export function Indice(value: number, measurement: SpacerDimension) {
  return <div className={mergeClasses('indice', measurement)}>
    {value}
  </div>
}