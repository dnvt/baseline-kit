import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './components'
import './styles/demo.css'
import './styles/reset.css'
import './styles/controls.css'
import '../dist/theme.css'

document.body.innerHTML = '<div id="root"></div>'
const root = createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
