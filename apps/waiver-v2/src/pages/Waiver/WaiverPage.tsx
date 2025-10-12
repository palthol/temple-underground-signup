import React from 'react'
import { useI18n } from '../../shared/i18n/I18nProvider'
import { WaiverWizardLayout } from '../../features/waiver/components/Wizard/Layout'
import { StepNavigation } from '../../features/waiver/components/Wizard/StepNavigation'

export const WaiverPage: React.FC = () => {
  const { t } = useI18n()
  const [index, setIndex] = React.useState(0)
  const total = 7
  const isFirst = index === 0
  const isLast = index === total - 1

  const onBack = () => setIndex((i) => Math.max(0, i - 1))
  const onNext = () => setIndex((i) => Math.min(total - 1, i + 1))

  const stepTitles = [
    'Personal Information',
    'Emergency Contact',
    'Health Assessment',
    'Injury Disclosure',
    'Initial Clauses',
    'Signature',
    'Review & Confirm',
  ]

  return (
    <WaiverWizardLayout
      title={t('app.title')}
      stepTitle={stepTitles[index]}
      stepIndicator={`Step ${index + 1} of ${total}`}
      statuses={{ apiStatus: 'ok', dbStatus: 'ok' }}
    >
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Placeholder content for step {index + 1}.</p>
        <StepNavigation
          isFirstStep={isFirst}
          isLastStep={isLast}
          onBack={onBack}
          onNext={onNext}
          disabledNext={false}
        />
      </div>
    </WaiverWizardLayout>
  )
}
