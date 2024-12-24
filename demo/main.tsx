import React from 'react'
import ReactDOM from 'react-dom/client'
import { GridSetups } from './components/GridSetups'

document.body.innerHTML = '<div id="root"></div>'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <GridSetups>
      <>
        <h1 className="demo-title">Grid Playground</h1>
        <p className="demo-description">
          This is a comprehensive demo showcasing the grid system capabilities.
          Use the controls to experiment with different grid configurations.
        </p>

        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="content-block">
            Content Block {i + 1}
          </div>
        ))}
      </>
    </GridSetups>
  </React.StrictMode>,
)
