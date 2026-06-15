import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {ThemeProvider} from "./context/ThemeContext.tsx";
import './index.css'
import App from './App.tsx'
import {HelmetProvider} from 'react-helmet-async'
import {pushDiagnostics} from './testing/push-diagnostic'

(window as any).pushDiagnostics = pushDiagnostics;

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HelmetProvider>
            <ThemeProvider>
                <App/>
            </ThemeProvider>
        </HelmetProvider>
    </StrictMode>,
)
