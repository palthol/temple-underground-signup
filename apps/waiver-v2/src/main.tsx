import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { I18nProvider } from './shared/i18n/I18nProvider'
import { WaiverPage } from './pages/Waiver'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <I18nProvider>
      <WaiverPage />
    </I18nProvider>
  </React.StrictMode>,
)
