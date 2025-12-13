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
  return (
    <div className="mt-4 flex items-center justify-between gap-2">
      <button
        type="button"
        className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
        onClick={onBack}
        disabled={isFirstStep || !!isSubmitting}
      >
        {t('nav.back')}
      </button>
      <button
        type="button"
        className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        onClick={onNext}
        disabled={!!disabledNext || !!isSubmitting}
      >
        {isLastStep ? labels.submit : labels.nextAlt ?? labels.next}
      </button>
    </div>
  )
}

export default StepNavigation


