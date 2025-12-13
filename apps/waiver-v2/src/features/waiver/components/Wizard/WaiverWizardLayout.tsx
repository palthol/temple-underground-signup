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
  if (status === 'ok') return 'text-brand-gold'
  if (status === 'fail') return 'text-brand-red'
  return 'text-brand-light'
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
    <div className="mx-auto max-w-screen-md space-y-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-light">{title}</h1>
        <label className="text-sm text-brand-light">
          <span className="mr-2">{t('wizard.language')}</span>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as any)}
            className="rounded-md border-brand-bronze bg-brand-dark text-sm text-brand-light focus:border-brand-gold focus:ring-brand-gold"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </label>
      </header>

      {statuses && (
        <div className="flex gap-4 text-xs text-brand-light">
          <span className={statusColor(statuses.apiStatus)}>
            {t('status.api')}: {statuses.apiStatus}
          </span>
          <span className={statusColor(statuses.dbStatus)}>
            {t('status.db')}: {statuses.dbStatus}
          </span>
        </div>
      )}

      {(stepTitle || stepIndicator) && (
        <div className="space-y-1">
          {stepIndicator && (
            <div className="text-xs text-brand-gold">{stepIndicator}</div>
          )}
          {stepTitle && <div className="text-lg font-semibold text-brand-light">{stepTitle}</div>}
        </div>
      )}

      <section className="space-y-6 rounded-2xl bg-brand-mid p-6 shadow-lg">{children}</section>
    </div>
  )
}


