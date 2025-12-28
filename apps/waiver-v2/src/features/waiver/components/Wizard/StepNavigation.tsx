import React from 'react'
import { useI18n } from '../../../../shared/i18n/I18nProvider'

type Props = {
  disabledNext?: boolean
  isFirstStep: boolean
  isLastStep: boolean
  isSubmitting?: boolean
  onBack: () => void
  onNext: () => void
  labels: {
    back: string
    next: string
    submit: string
    nextAlt?: string
  }
}

export const StepNavigation: React.FC<Props> = ({
  disabledNext,
  isFirstStep,
  isLastStep,
  isSubmitting,
  onBack,
  onNext,
  labels,
}) => {
  const { t } = useI18n()
  const nextLabel = isLastStep ? labels.submit : labels.nextAlt ?? labels.next

  return (
    <div className="mt-8 flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-between">
      <button
        type="button"
        onClick={onBack}
        disabled={isFirstStep || !!isSubmitting}
        className="inline-flex items-center justify-center rounded-full border border-brand-outline/60 bg-brand-surface px-5 py-2 text-sm font-semibold uppercase tracking-[0.15em] text-brand-secondary transition hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t('nav.back')}
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!!disabledNext || !!isSubmitting}
        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-slate-700 via-slate-800 to-blue-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-slate-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {nextLabel}
      </button>
    </div>
  )
}

export default StepNavigation
