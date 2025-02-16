import { Fragment, StrictMode, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { GridSetups, Indice } from './components'

import { Spacer, Box, Config, Baseline, Layout, Stack } from '../dist'
import '../dist/styles.css'

export interface ContentProps {
  showBaseline?: boolean;
}

document.body.innerHTML = '<div id="root"></div>'
const root = createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <StrictMode>
    <GridSetups />
  </StrictMode>
)