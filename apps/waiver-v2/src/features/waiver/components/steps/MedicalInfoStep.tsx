import React from 'react'
import { useFormContext } from 'react-hook-form'
import type { WaiverFormInput } from '../../hooks/useWaiverForm'

const yesNoOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

export const MedicalInfoStep: React.FC = () => {
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
      <section>
        <h3 className="text-sm font-semibold">Health Assessment</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(
            [
              'heartDisease',
              'shortnessOfBreath',
              'highBloodPressure',
              'smoking',
              'diabetes',
              'familyHistory',
              'workouts',
              'medication',
              'alcohol',
            ] as const
          ).map((key) => (
            <label key={key} className="flex items-center justify-between rounded border p-3 text-sm">
              <span className="pr-4 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <input
                type="checkbox"
                {...register(`medicalInformation.${key}`)}
                checked={Boolean(medical?.[key])}
              />
            </label>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium">Date of last physical (optional)</label>
          <input
            type="date"
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            {...register('medicalInformation.lastPhysical')}
          />
          {medicalError('lastPhysical') && (
            <p className="mt-1 text-xs text-red-600">{medicalError('lastPhysical')}</p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium">Exercise restriction (optional)</label>
          <textarea
            rows={3}
            className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            {...register('medicalInformation.exerciseRestriction')}
          />
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium">Injuries</p>
          {(
            [
              ['medicalInformation.injuries.knees', 'Knees'] as const,
              ['medicalInformation.injuries.lowerBack', 'Lower Back'] as const,
              ['medicalInformation.injuries.neckShoulders', 'Neck / Shoulders'] as const,
              ['medicalInformation.injuries.hipPelvis', 'Hip / Pelvis'] as const,
            ]
          ).map(([path, label]) => (
            <label key={path} className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register(path)} />
              <span>{label}</span>
            </label>
          ))}

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('medicalInformation.injuries.other.has')} />
              <span>Other injury</span>
            </label>
            {medical?.injuries?.other?.has && (
              <input
                type="text"
                className="w-full rounded border border-gray-300 p-2 text-sm"
                placeholder="Describe other injuries"
                {...register('medicalInformation.injuries.other.details')}
              />
            )}
            {injuryOtherError && <p className="text-xs text-red-600">{injuryOtherError}</p>}
          </div>
        </div>
      </section>

      <section className="border-t pt-6">
        <h3 className="text-sm font-semibold">Recent Injuries</h3>

        <div className="mt-4 space-y-3 text-sm">
          <div>
            <p className="mb-1">Have you experienced a recent injury?</p>
            <div className="flex gap-4">
              {yesNoOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2">
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
              <p className="mt-1 text-xs text-red-600">{medicalError('hadRecentInjury')}</p>
            )}
          </div>

          {medical?.hadRecentInjury === 'yes' && (
            <div>
              <label className="block text-sm font-medium">Injury details</label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
                {...register('medicalInformation.injuryDetails')}
              />
              {medicalError('injuryDetails') && (
                <p className="mt-1 text-xs text-red-600">{medicalError('injuryDetails')}</p>
              )}
            </div>
          )}

          <div>
            <p className="mb-1">Have you been cleared by a physician?</p>
            <div className="flex gap-4">
              {yesNoOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    value={option.value}
                    {...register('medicalInformation.physicianCleared')}
                    checked={medical?.physicianCleared === option.value}
                    disabled={medical?.hadRecentInjury !== 'yes'}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {medicalError('physicianCleared') && (
              <p className="mt-1 text-xs text-red-600">{medicalError('physicianCleared')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Clearance notes (optional)</label>
            <textarea
              rows={3}
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              {...register('medicalInformation.clearanceNotes')}
            />
            {medicalError('clearanceNotes') && (
              <p className="mt-1 text-xs text-red-600">{medicalError('clearanceNotes')}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
