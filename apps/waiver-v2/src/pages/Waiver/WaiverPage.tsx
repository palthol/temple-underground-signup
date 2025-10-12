import React from 'react'
import { useI18n } from '../../shared/i18n/I18nProvider'
import { WaiverWizardLayout } from '../../features/waiver/components/Wizard/WaiverWizardLayout'
import { StepNavigation } from '../../features/waiver/components/Wizard/StepNavigation'
import { useWaiverForm } from '../../features/waiver/hooks/useWaiverForm'
import { useWaiverSteps } from '../../features/waiver/hooks/useWaiverSteps'

export const WaiverPage: React.FC = () => {
  const { t } = useI18n()

  const { methods, stepFields } = useWaiverForm(t)
  const total = 7
  const { index, isFirst, isLast, goBack, goNext } = useWaiverSteps(total)

  const stepTitles = [
    'Personal Information',
    'Emergency Contact',
    'Health Assessment',
    'Injury Disclosure',
    'Initial Clauses',
    'Signature',
    'Review & Confirm',
  ]

  const onBack = () => goBack()
  const onNext = async () => {
    const currentStepId = (
      ['personalInfo','emergencyContact','healthAssessment','injuryDisclosure','initialClauses','signature','review'] as const
    )[index]
    const valid = await methods.trigger(stepFields[currentStepId], { shouldFocus: true })
    if (!valid) return
    goNext()
  }

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
