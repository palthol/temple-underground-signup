import React from 'react'
import { useI18n } from '../../../../shared/i18n/I18nProvider'

export type ServiceStatus = 'ok' | 'fail' | 'unknown'

type Props = {
  title: string
  stepTitle?: string
  stepIndicator?: string
  statuses?: {
    apiStatus: ServiceStatus
    dbStatus: ServiceStatus
  }
  children: React.ReactNode
}

const statusColor = (status: ServiceStatus) => {
  if (status === 'ok') return 'text-emerald-600'
  if (status === 'fail') return 'text-red-600'
  return 'text-gray-500'
}

export const WaiverWizardLayout: React.FC<Props> = ({
  title,
  stepTitle,
  stepIndicator,
  statuses,
  children,
}) => {
  const { t, locale, setLocale } = useI18n()

  return (
    <div className="mx-auto max-w-screen-sm p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <label className="text-sm">
          <span className="mr-2">{t('wizard.language')}</span>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as any)}
            className="rounded-md border-gray-300 text-sm"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </label>
      </header>

      {statuses && (
        <div className="flex gap-4 text-xs">
          <span className={statusColor(statuses.apiStatus)}>
            {t('status.api')}: {statuses.apiStatus}
          </span>
          <span className={statusColor(statuses.dbStatus)}>
            {t('status.db')}: {statuses.dbStatus}
          </span>
        </div>
      )}

      {(stepTitle || stepIndicator) && (
        <div>
          {stepIndicator && (
            <div className="text-xs text-gray-500">{stepIndicator}</div>
          )}
          {stepTitle && <div className="text-lg font-medium">{stepTitle}</div>}
        </div>
      )}

      <section className="rounded-md border bg-white p-4 shadow-sm">{children}</section>
    </div>
  )
}


