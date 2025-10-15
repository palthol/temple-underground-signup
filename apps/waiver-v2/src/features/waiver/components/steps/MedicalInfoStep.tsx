import React from 'react'
import { useFormContext } from 'react-hook-form'
import type { WaiverFormInput } from '../../hooks/useWaiverForm'
import { useI18n } from '../../../../shared/i18n/I18nProvider'

const yesNoOptions = (t: ReturnType<typeof useI18n>['t']) => [
  { value: 'yes', label: t('common.yes') },
  { value: 'no', label: t('common.no') },
]

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

  const yesNo = React.useMemo(() => yesNoOptions(t), [t])
  const medical = watch('medicalInformation')

  const medicalError = <K extends keyof WaiverFormInput['medicalInformation']>(key: K) =>
    errors.medicalInformation?.[key]?.message

  const injuryOtherError = errors.medicalInformation?.injuries?.other?.details?.message

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-base font-semibold text-slate-800">{t('medicalInfo.title')}</h2>
        <p className="text-sm text-slate-600">{t('medicalInfo.description')}</p>
      </header>

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">{t('medicalInfo.sections.health.title')}</h3>
          <p className="text-xs text-slate-500">{t('medicalInfo.sections.health.instructions')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {healthKeys.map((key) => (
            <label key={key} className="flex items-center justify-between rounded border p-3 text-sm">
              <span className="pr-4 text-slate-700">{t(`medicalInfo.sections.health.fields.${key}`)}</span>
              <input
                type="checkbox"
                {...register(`medicalInformation.${key}`)}
                checked={Boolean(medical?.[key])}
              />
            </label>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t('medicalInfo.sections.additional.lastPhysical')}
            </label>
            <input
              type="date"
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              {...register('medicalInformation.lastPhysical')}
            />
            {medicalError('lastPhysical') && (
              <p className="mt-1 text-xs text-red-600">{medicalError('lastPhysical')}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t('medicalInfo.sections.additional.exerciseRestriction')}
            </label>
            <textarea
              rows={3}
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              {...register('medicalInformation.exerciseRestriction')}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 border-t pt-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">{t('medicalInfo.sections.injuries.title')}</h3>
          <p className="text-xs text-slate-500">{t('medicalInfo.sections.injuries.instructions')}</p>
        </div>
        <div className="flex flex-col gap-2">
          {injuryOptions.map(([key, labelKey]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register(`medicalInformation.injuries.${key}`)} />
              <span>{t(labelKey)}</span>
            </label>
          ))}
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('medicalInformation.injuries.other.has')} />
            <span>{t('medicalInfo.sections.injuries.fields.other')}</span>
          </label>
          {medical?.injuries?.other?.has && (
            <input
              type="text"
              className="w-full rounded border border-gray-300 p-2 text-sm"
              placeholder={t('medicalInfo.sections.injuries.otherPlaceholder')}
              {...register('medicalInformation.injuries.other.details')}
            />
          )}
          {injuryOtherError && <p className="text-xs text-red-600">{injuryOtherError}</p>}
        </div>
      </section>

      <section className="space-y-3 border-t pt-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">{t('medicalInfo.sections.recent.title')}</h3>
          <p className="text-xs text-slate-500">{t('medicalInfo.sections.recent.instructions')}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-slate-700">{t('medicalInfo.sections.recent.question')}</p>
          <div className="flex gap-4">
            {yesNo.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  value={option.value}
                  {...register('medicalInformation.hadRecentInjury')}
                  checked={medical?.hadRecentInjury === option.value}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {medicalError('hadRecentInjury') && (
            <p className="text-xs text-red-600">{medicalError('hadRecentInjury')}</p>
          )}
        </div>

        {medical?.hadRecentInjury === 'yes' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              {t('medicalInfo.sections.recent.details')}
            </label>
            <textarea
              rows={3}
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              {...register('medicalInformation.injuryDetails')}
            />
            {medicalError('injuryDetails') && (
              <p className="text-xs text-red-600">{medicalError('injuryDetails')}</p>
            )}
            <div className="space-y-2">
              <p className="text-sm text-slate-700">{t('medicalInfo.sections.recent.physician')}</p>
              <div className="flex gap-4">
                {yesNo.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      value={option.value}
                      {...register('medicalInformation.physicianCleared')}
                      checked={medical?.physicianCleared === option.value}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {medicalError('physicianCleared') && (
                <p className="text-xs text-red-600">{medicalError('physicianCleared')}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t('medicalInfo.sections.recent.notes')}
              </label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
                {...register('medicalInformation.clearanceNotes')}
              />
              {medicalError('clearanceNotes') && (
                <p className="text-xs text-red-600">{medicalError('clearanceNotes')}</p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
