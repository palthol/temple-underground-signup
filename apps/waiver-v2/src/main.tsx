import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { I18nProvider } from './shared/i18n/I18nProvider'
import { WaiverPage } from './pages/Waiver'

const mountNode = document.getElementById('app')

if (!mountNode) {
  throw new Error('Failed to find root element with id "app"')
}

ReactDOM.createRoot(mountNode).render(
  <React.StrictMode>
    <I18nProvider>
      <WaiverPage />
    </I18nProvider>
  </React.StrictMode>,
)
