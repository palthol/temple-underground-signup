import React from 'react'
import { useI18n } from '../../../../shared/i18n/I18nProvider'
import { Button } from '../../../../components/ui/button'

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
      <Button type="button" variant="outline" size="sm" onClick={onBack} disabled={isFirstStep || !!isSubmitting}>
        {t('nav.back')}
      </Button>

      <Button type="button" variant="gradient" onClick={onNext} disabled={!!disabledNext || !!isSubmitting}>
        {nextLabel}
      </Button>
    </div>
  )
}

export default StepNavigation
