import React from 'react'
import { useI18n } from '../../../../shared/i18n/I18nProvider'
import { Badge } from '../common/Badge'
import { useParallaxScroll } from '../../hooks/useParallaxScroll'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select'

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

const statusTone = (status: ServiceStatus) => {
  switch (status) {
    case 'ok':
      return 'success' as const
    case 'fail':
      return 'error' as const
    default:
      return 'default' as const
  }
}

export const WaiverWizardLayout: React.FC<Props> = ({
  title,
  stepTitle,
  stepIndicator,
  statuses,
  children,
}) => {
  const { t, locale, setLocale } = useI18n()
  const parallaxOffset = useParallaxScroll(0.15)
  const localeCode = locale === 'es' ? 'ES' : 'ENG'

  return (
    <div className="min-h-screen bg-brand-surface-variant/80 py-10">
      <div className="mx-auto max-w-5xl space-y-8 px-6">
        <header className="mesh-gradient-header rounded-card relative p-8 text-white shadow-brand-soft transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.998] active:shadow-lg">
          <div
            className="mesh-gradient-header-bg"
            style={{
              transform: `translate3d(0, ${parallaxOffset * 0.3}px, 0)`,
            }}
          />
          <div
            className="mesh-gradient-header-noise"
            style={{
              transform: `translate3d(0, ${parallaxOffset * 0.2}px, 0)`,
            }}
          />
          <div
            className="mesh-gradient-header-highlight"
            style={{
              transform: `translate3d(0, ${parallaxOffset * 0.25}px, 0)`,
            }}
          />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
              {(stepTitle || stepIndicator) && (
                <div className="space-y-1 text-sm text-white/80">
                  {stepIndicator && <div className="font-semibold uppercase tracking-[0.3em] text-white/70">{stepIndicator}</div>}
                  {stepTitle && <div className="text-xl font-semibold">{stepTitle}</div>}
                </div>
              )}
            </div>

            <div className="flex flex-col items-start gap-4 lg:items-end">
              <label className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium tracking-wide text-white">
                <span>{t('wizard.language')}</span>
                <Select
                  value={locale}
                  onValueChange={(value) => setLocale(value as 'en' | 'es')}
                >
                  <SelectTrigger className="h-9 w-[96px] border-none bg-transparent px-2.5 text-white shadow-none">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-white/90"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18" />
                      <path d="M12 3a13 13 0 0 1 0 18" />
                      <path d="M12 3a13 13 0 0 0 0 18" />
                    </svg>
                    <SelectValue aria-label={localeCode}>{localeCode}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </label>

              {statuses && (
                <div className="flex flex-wrap gap-3">
                  <Badge tone={statusTone(statuses.apiStatus)}>
                    {t('status.api')}: {statuses.apiStatus}
                  </Badge>
                  <Badge tone={statusTone(statuses.dbStatus)}>
                    {t('status.db')}: {statuses.dbStatus}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="rounded-card border border-brand-outline/30 bg-brand-surface p-8 shadow-brand-soft transition-all duration-300 hover:shadow-xl hover:shadow-brand-outline/20 hover:border-brand-outline/40 active:scale-[0.999] active:shadow-lg">
          <div className="space-y-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

