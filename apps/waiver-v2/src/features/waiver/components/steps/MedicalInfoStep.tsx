import React from 'react'
import { useFormContext } from 'react-hook-form'
import type { WaiverFormInput } from '../../hooks/useWaiverForm'
import { useI18n } from '../../../../shared/i18n/I18nProvider'
import { SectionCard } from '../common/SectionCard'
import { Field, checkboxClasses, inputBaseClasses, textareaBaseClasses } from '../common/Field'
import { Chip } from '../common/Chip'

const healthKeys: (keyof WaiverFormInput['medicalInformation'])[] = [
  'heartDisease',
  'shortnessOfBreath',
  'highBloodPressure',
  'smoking',
  'diabetes',
  'familyHistory',
  'workouts',
  'medication',
  'alcohol',
]

const injuryOptions: Array<[keyof WaiverFormInput['medicalInformation']['injuries'], string]> = [
  ['knees', 'medicalInfo.sections.injuries.fields.knees'],
  ['lowerBack', 'medicalInfo.sections.injuries.fields.lowerBack'],
  ['neckShoulders', 'medicalInfo.sections.injuries.fields.neckShoulders'],
  ['hipPelvis', 'medicalInfo.sections.injuries.fields.hipPelvis'],
]

export const MedicalInfoStep: React.FC = () => {
  const { t } = useI18n()
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<WaiverFormInput>()

  const medical = watch('medicalInformation')

  const medicalError = <K extends keyof WaiverFormInput['medicalInformation']>(key: K) =>
    errors.medicalInformation?.[key]?.message

  const injuryOtherError = errors.medicalInformation?.injuries?.other?.details?.message

  return (
    <div className="space-y-6">
      <SectionCard
        title={t('medicalInfo.title')}
        subtitle={t('medicalInfo.description')}
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-secondary">
              {t('medicalInfo.sections.health.title')}
            </h3>
            <p className="text-sm text-brand-secondary/75">{t('medicalInfo.sections.health.instructions')}</p>
            <div className="grid gap-4 md:grid-cols-2">
              {healthKeys.map((key) => {
                const isChecked = Boolean(medical?.[key])
                return (
                  <label
                    key={key}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      isChecked
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-brand-outline/50 bg-brand-surface text-brand-on-surface'
                    }`}
                  >
                    <span className="pr-4">{t(`medicalInfo.sections.health.fields.${key}`)}</span>
                    <input type="checkbox" className={checkboxClasses} {...register(`medicalInformation.${key}`)} />
                  </label>
                )
              })}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Field
              label={t('medicalInfo.sections.additional.lastPhysical')}
              error={medicalError('lastPhysical') || undefined}
            >
              <input type="date" className={inputBaseClasses} {...register('medicalInformation.lastPhysical')} />
            </Field>
            <Field label={t('medicalInfo.sections.additional.exerciseRestriction')}>
              <textarea className={textareaBaseClasses} rows={3} {...register('medicalInformation.exerciseRestriction')} />
            </Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={t('medicalInfo.sections.injuries.title')}
        subtitle={t('medicalInfo.sections.injuries.instructions')}
      >
        <div className="flex flex-wrap gap-3">
          {injuryOptions.map(([key, labelKey]) => {
            const active = Boolean(medical?.injuries?.[key])
            return (
              <label key={key} className="inline-flex items-center gap-3">
                <Chip label={t(labelKey)} active={active} />
                <input type="checkbox" className={checkboxClasses} {...register(`medicalInformation.injuries.${key}`)} />
              </label>
            )
          })}
        </div>

        <div className="mt-6 space-y-3">
          <label className="inline-flex items-center gap-3 text-sm font-semibold text-brand-on-surface">
            <input type="checkbox" className={checkboxClasses} {...register('medicalInformation.injuries.other.has')} />
            <span>{t('medicalInfo.sections.injuries.fields.other')}</span>
          </label>
          {medical?.injuries?.other?.has && (
            <input
              type="text"
              className={inputBaseClasses}
              placeholder={t('medicalInfo.sections.injuries.otherPlaceholder')}
              {...register('medicalInformation.injuries.other.details')}
            />
          )}
          {injuryOtherError && <p className="text-xs font-medium text-brand-error">{injuryOtherError}</p>}
        </div>
      </SectionCard>

      <SectionCard
        title={t('medicalInfo.sections.recent.title')}
        subtitle={t('medicalInfo.sections.recent.instructions')}
      >
        <div className="space-y-4">
          <Field
            label={t('medicalInfo.sections.recent.question')}
            error={medicalError('hadRecentInjury') || undefined}
          >
            <div className="flex flex-wrap gap-4">
              {(['yes', 'no'] as const).map((option) => (
                <label
                  key={option}
                  className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] transition ${
                    medical?.hadRecentInjury === option
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                      : 'border-brand-outline/60 bg-brand-surface text-brand-secondary'
                  }`}
                >
                  <input
                    type="radio"
                    value={option}
                    className={checkboxClasses}
                    {...register('medicalInformation.hadRecentInjury')}
                    checked={medical?.hadRecentInjury === option}
                  />
                  {t(`common.${option === 'yes' ? 'yes' : 'no'}`)}
                </label>
              ))}
            </div>
          </Field>

          {medical?.hadRecentInjury === 'yes' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Field
                label={t('medicalInfo.sections.recent.details')}
                error={medicalError('injuryDetails') || undefined}
                className="lg:col-span-2"
              >
                <textarea
                  className={textareaBaseClasses}
                  rows={3}
                  {...register('medicalInformation.injuryDetails')}
                />
              </Field>

              <Field
                label={t('medicalInfo.sections.recent.physician')}
                error={medicalError('physicianCleared') || undefined}
              >
                <div className="flex gap-4">
                  {(['yes', 'no'] as const).map((option) => (
                    <label key={option} className="inline-flex items-center gap-2 text-sm font-medium text-brand-on-surface">
                      <input
                        type="radio"
                        value={option}
                        className={checkboxClasses}
                        {...register('medicalInformation.physicianCleared')}
                        checked={medical?.physicianCleared === option}
                      />
                      {t(`common.${option === 'yes' ? 'yes' : 'no'}`)}
                    </label>
                  ))}
                </div>
              </Field>

              <Field label={t('medicalInfo.sections.recent.notes')} className="lg:col-span-2">
                <textarea className={textareaBaseClasses} rows={3} {...register('medicalInformation.clearanceNotes')} />
              </Field>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
