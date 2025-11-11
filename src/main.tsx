import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
// Importar datos de ejemplo para testing
import './utils/datosDeEjemplo'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
