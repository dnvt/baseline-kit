import type { CSSProperties } from 'react'

import styles from './styles.module.css'

//
//const initialState: StackState = {
//  baseSize: STACK.DEFAULTS.BASE_SIZE,
//  maxWidth: STACK.DEFAULTS.MAX_WIDTH,
//  show: STACK.DEFAULTS.SHOW,
//  zIndex: STACK.DEFAULTS.Z_INDEX,
//  styles: {},
//}
//
//
//export function Spacer({ width, height, config, show, className }: SpacerProps) {
//
//  return (
//    <div
//      className={cx(
//        styles['spacer'],
//        (show || state.show) && styles['guides'],
//        className,
//      )}
//      style={{
//        '--spacer-z-index': state.zIndex,
//        '--spacer-height': height + 'px',
//        '--spacer-width': width,
//      } as CSSProperties}
//    />
//  )
//}