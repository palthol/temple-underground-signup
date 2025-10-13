import React from 'react'
import { FormProvider } from 'react-hook-form'
import { useI18n } from '../../shared/i18n/I18nProvider'
import { WaiverWizardLayout } from '../../features/waiver/components/Wizard/WaiverWizardLayout'
import { StepNavigation } from '../../features/waiver/components/Wizard/StepNavigation'
import { useWaiverForm } from '../../features/waiver/hooks/useWaiverForm'
import { useWaiverSteps } from '../../features/waiver/hooks/useWaiverSteps'
import { PersonalInfoStep, MedicalInfoStep, LegalConfirmationStep, ReviewStep } from '../../features/waiver/components/steps'
import { getStepSchema } from '../../features/waiver/schema/waiver'
import { z } from 'zod'

const stepTitles = [
  'Personal & Emergency Information',
  'Medical Information',
  'Legal Confirmation',
  'Review & Submit',
]

const stepIds = (
  ['personalInfo','medicalInformation','legalConfirmation','review'] as const
)

export const WaiverPage: React.FC = () => {
  const { t } = useI18n()
  const { methods } = useWaiverForm(t)
  const total = stepIds.length
  const { index, isFirst, isLast, goBack, goNext } = useWaiverSteps(total)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const currentStepId = stepIds[index]
  const currentSchema = React.useMemo(() => getStepSchema(t, currentStepId), [t, currentStepId])
  const currentStepData = methods.watch(currentStepId as any)
  const validationResult = (currentSchema as z.ZodTypeAny).safeParse(currentStepData)
  const canAdvance = validationResult.success && !isSubmitting

  const onBack = () => goBack()
  const onNext = async () => {
    if (!canAdvance) {
      validationResult.error?.issues.forEach((issue) => {
        const field = [currentStepId, ...(issue.path as (string | number)[])].join('.')
        methods.setError(field as any, { type: 'zod', message: issue.message }, { shouldFocus: true })
      })
      return
    }
    if (isLast) {
      setIsSubmitting(true)
      try {
        await methods.handleSubmit(async (formValues) => {
          console.log('submit payload', formValues)
        })()
      } finally {
        setIsSubmitting(false)
      }
    } else {
      goNext()
    }
  }

  const renderStep = () => {
    switch (currentStepId) {
      case 'personalInfo':
        return <PersonalInfoStep />
      case 'medicalInformation':
        return <MedicalInfoStep />
      case 'legalConfirmation':
        return <LegalConfirmationStep />
      case 'review':
      default:
        return <ReviewStep />
    }
  }

  return (
    <FormProvider {...methods}>
      <WaiverWizardLayout
        title={t('app.title')}
        stepTitle={stepTitles[index]}
        stepIndicator={`Step ${index + 1} of ${total}`}
        statuses={{ apiStatus: 'ok', dbStatus: 'ok' }}
      >
        <div className="space-y-4">
          {renderStep()}
          <StepNavigation
            isFirstStep={isFirst}
            isLastStep={isLast}
            onBack={onBack}
            onNext={onNext}
            disabledNext={!canAdvance}
            labels={{
              back: t('nav.back'),
              next: t('nav.next'),
              submit: isSubmitting ? 'Submitting…' : t('nav.submit'),
            }}
            isSubmitting={isSubmitting}
          />
        </div>
      </WaiverWizardLayout>
    </FormProvider>
  )
}
