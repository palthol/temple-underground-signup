import React from 'react'
import { FormProvider, type FieldPath } from 'react-hook-form'
import { useI18n } from '../../shared/i18n/I18nProvider'
import { WaiverWizardLayout } from '../../features/waiver/components/Wizard/WaiverWizardLayout'
import { StepNavigation } from '../../features/waiver/components/Wizard/StepNavigation'
import { useWaiverForm, type WaiverFormInput } from '../../features/waiver/hooks/useWaiverForm'
import { useWaiverSteps } from '../../features/waiver/hooks/useWaiverSteps'
import { PersonalInfoStep, MedicalInfoStep, LegalConfirmationStep, ReviewStep } from '../../features/waiver/components/steps'
import { getStepSchema } from '../../features/waiver/schema/waiver'
import { z } from 'zod'
import { submitWaiver, type SubmitWaiverFieldError, type SubmitWaiverSuccess } from '../../features/waiver/api/submitWaiver'
import { getWaiverPdf } from '../../features/waiver/api/getWaiverPdf'
import { fillSampleWaiver } from '../../features/waiver/utils/sampleWaiver'

const stepTitles = [
  'Personal & Emergency Information',
  'Medical Information',
  'Legal Confirmation',
  'Review & Submit',
]

const stepIds = ([
  'personalInfo',
  'medicalInformation',
  'legalConfirmation',
  'review',
] as const)

export const WaiverPage: React.FC = () => {
  const { t, locale } = useI18n()
  const { methods } = useWaiverForm(t)
  const total = stepIds.length
  const { index, isFirst, isLast, goBack, goNext, reset: resetSteps } = useWaiverSteps(total)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = React.useState<SubmitWaiverSuccess | null>(null)
  const [isDownloading, setIsDownloading] = React.useState(false)
  const [downloadError, setDownloadError] = React.useState<string | null>(null)
  const currentStepId = stepIds[index]
  const currentSchema = React.useMemo(() => getStepSchema(t, currentStepId), [t, currentStepId])
  const currentStepData = methods.watch(currentStepId as any)
  const validationResult = (currentSchema as z.ZodTypeAny).safeParse(currentStepData)
  const canAdvance = validationResult.success && !isSubmitting && !submitSuccess

  const serverFieldMap = React.useMemo(() => {
    const mapping: Partial<Record<string, FieldPath<WaiverFormInput>>> = {
      'participant.full_name': 'personalInfo.fullName',
      'participant.date_of_birth': 'personalInfo.dateOfBirth',
      'participant.address_line': 'personalInfo.addressLine1',
      'participant.address_line_2': 'personalInfo.addressLine2',
      'participant.city': 'personalInfo.city',
      'participant.state': 'personalInfo.state',
      'participant.zip': 'personalInfo.postalCode',
      'participant.email': 'personalInfo.email',
      'participant.phone': 'personalInfo.phone',
      'emergency_contact.name': 'emergencyContact.name',
      'emergency_contact.relationship': 'emergencyContact.relationship',
      'emergency_contact.phone': 'emergencyContact.phone',
      'emergency_contact.email': 'emergencyContact.email',
      'medical_information.had_recent_injury': 'medicalInformation.hadRecentInjury',
      'medical_information.injury_details': 'medicalInformation.injuryDetails',
      'medical_information.physician_cleared': 'medicalInformation.physicianCleared',
      'medical_information.clearance_notes': 'medicalInformation.clearanceNotes',
      'medical_information.last_physical': 'medicalInformation.lastPhysical',
      'medical_information.exercise_restriction': 'medicalInformation.exerciseRestriction',
      'legal_confirmation.risk_initials': 'legalConfirmation.riskInitials',
      'legal_confirmation.release_initials': 'legalConfirmation.releaseInitials',
      'legal_confirmation.indemnification_initials': 'legalConfirmation.indemnificationInitials',
      'legal_confirmation.media_initials': 'legalConfirmation.mediaInitials',
      'legal_confirmation.accepted_terms': 'legalConfirmation.acceptedTerms',
      signature: 'legalConfirmation.signature.pngDataUrl',
      'review.confirm_accuracy': 'review.confirmAccuracy',
    }
    return mapping
  }, [])

  const translateMessageKey = React.useCallback(
    (key?: string | null) => {
      if (!key) return undefined
      const translated = t(key)
      return translated === key ? undefined : translated
    },
    [t],
  )

  const applyServerErrors = React.useCallback(
    (errors: SubmitWaiverFieldError[]) => {
      errors.forEach(({ field, messageKey }) => {
        const formPath = serverFieldMap[field]
        if (formPath) {
          methods.setError(formPath, {
            type: 'server',
            message: translateMessageKey(messageKey) ?? t('submission.error.validation'),
          })
        }
      })
    },
    [methods, serverFieldMap, t, translateMessageKey],
  )

  const handleStartOver = React.useCallback(() => {
    methods.reset()
    resetSteps()
    setSubmitSuccess(null)
    setSubmitError(null)
    setDownloadError(null)
  }, [methods, resetSteps])

  const handleFillSample = React.useCallback(() => {
    fillSampleWaiver(methods)
    resetSteps()
    setSubmitError(null)
    setDownloadError(null)
  }, [methods, resetSteps])

  const handleDownloadPdf = React.useCallback(async () => {
    if (!submitSuccess) return
    setIsDownloading(true)
    setDownloadError(null)
    try {
      const result = await getWaiverPdf(submitSuccess.waiverId)
      if (!result.ok) {
        const translated = result.error ? translateMessageKey(`submission.error.${result.error}`) : undefined
        setDownloadError(translated ?? result.error ?? t('submission.error.generic'))
        return
      }

      const blobUrl = URL.createObjectURL(result.blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = result.fileName
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      if (error instanceof Error) {
        const translated = translateMessageKey(error.message)
        setDownloadError(translated ?? error.message)
      } else {
        setDownloadError(t('submission.error.generic'))
      }
    } finally {
      setIsDownloading(false)
    }
  }, [submitSuccess, t, translateMessageKey])

  const onBack = () => {
    if (submitSuccess) return
    setSubmitError(null)
    goBack()
  }

  const onNext = async () => {
    if (submitSuccess) return
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
          setSubmitError(null)
          const result = await submitWaiver(formValues, locale)
          if (result.ok) {
            setSubmitSuccess(result.data)
            methods.reset(formValues)
            return
          }

          if (result.errors?.length) {
            applyServerErrors(result.errors)
            setSubmitError(t('submission.error.validation'))
            return
          }

          if (result.error === 'network_error') {
            setSubmitError(t('submission.error.network'))
            return
          }

          if (result.error) {
            const translated = translateMessageKey(`submission.error.${result.error}`)
            setSubmitError(translated ?? t('submission.error.generic'))
            return
          }

          setSubmitError(t('submission.error.generic'))
        })()
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setSubmitError(null)
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

  const stepTitle = submitSuccess ? t('submission.success.title') : stepTitles[index]
  const stepIndicator = submitSuccess ? undefined : `Step ${index + 1} of ${total}`
  const apiStatus = submitError ? 'fail' : submitSuccess ? 'ok' : 'unknown'

  return (
    <FormProvider {...methods}>
      <WaiverWizardLayout
        title={t('app.title')}
        stepTitle={stepTitle}
        stepIndicator={stepIndicator}
        statuses={{ apiStatus, dbStatus: 'ok' }}
      >
        {submitSuccess ? (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-emerald-700">
                {t('submission.success.title')}
              </h2>
              <p className="text-sm text-slate-600">{t('submission.success.body')}</p>
            </div>
            <dl className="space-y-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-left">
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                  {t('submission.details.waiverId')}
                </dt>
                <dd className="break-all font-mono text-xs text-slate-700">{submitSuccess.waiverId}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                  {t('submission.details.participantId')}
                </dt>
                <dd className="break-all font-mono text-xs text-slate-700">{submitSuccess.participantId}</dd>
              </div>
              {submitSuccess.sha256 && (
                <div className="flex flex-col gap-1">
                  <dt className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                    {t('submission.details.sha256')}
                  </dt>
                  <dd className="break-all font-mono text-xs text-slate-700">{submitSuccess.sha256}</dd>
                </div>
              )}
            </dl>
            {downloadError && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {downloadError}
              </div>
            )}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDownloading ? t('submission.actions.downloading') : t('submission.actions.downloadPdf')}
              </button>
              <button
                type="button"
                onClick={handleStartOver}
                className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-900"
              >
                {t('submission.actions.new')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {submitError && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {submitError}
              </div>
            )}
            {renderStep()}
            {import.meta.env.DEV && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleFillSample}
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                >
                  Fill with sample data
                </button>
              </div>
            )}
            <StepNavigation
              isFirstStep={isFirst}
              isLastStep={isLast}
              onBack={onBack}
              onNext={onNext}
              disabledNext={!canAdvance}
              labels={{
                back: t('nav.back'),
                next: t('nav.next'),
                submit: isSubmitting ? t('nav.submitting') : t('nav.submit'),
              }}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </WaiverWizardLayout>
    </FormProvider>
  )
}
