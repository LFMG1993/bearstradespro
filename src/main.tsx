import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { pushDiagnostics } from './testing/push-diagnostic'

// Exponer herramienta de diagnóstico a la consola global para pruebas manuales
(window as any).pushDiagnostics = pushDiagnostics;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
