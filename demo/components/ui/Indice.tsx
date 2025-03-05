import { mergeClasses } from '@kit'

export function Indice(value: number, measurement: 'width' | 'height') {
  return <div className={mergeClasses('indice', measurement)}>
    {value}
  </div>
}