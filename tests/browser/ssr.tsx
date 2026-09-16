import { renderToString } from 'react-dom/server'
import { App } from './App'

export function renderApp() {
  return renderToString(<App />)
}
