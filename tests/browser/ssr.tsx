import { renderToString } from 'react-dom/server'
import { App } from './App'

export function renderApp(url = '/') {
  return renderToString(<App search={new URL(url, 'http://ssr').search} />)
}
