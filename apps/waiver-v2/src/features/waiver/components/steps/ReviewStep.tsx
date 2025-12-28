import React from 'react'
import { useFormContext } from 'react-hook-form'
import type { WaiverFormInput, WaiverFormData } from '../../hooks/useWaiverForm'
import { SectionCard } from '../common/SectionCard'
import { checkboxClasses } from '../common/Field'

const ReviewRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-brand-outline/15 pb-3 last:border-b-0 last:pb-0">
    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-secondary/80">{label}</span>
    <span className="text-sm text-brand-on-surface">
      {value !== undefined && value !== '' ? value : <span className="italic text-brand-secondary/70">Not provided</span>}
    </span>
  </div>
)

const yesNo = (value: boolean | undefined) => (value ? 'Yes' : 'No')

export const ReviewStep: React.FC = () => {
  const {
    getValues,
    register,
    formState: { errors },
  } = useFormContext<WaiverFormInput>()

  const { personalInfo, emergencyContact, medicalInformation, legalConfirmation } =
    getValues() as WaiverFormData

  return (
    <div className="space-y-6">
      <SectionCard title="Personal Information">
        <div className="grid gap-4 md:grid-cols-2">
          <ReviewRow label="Full name" value={personalInfo.fullName} />
          <ReviewRow label="Date of birth" value={personalInfo.dateOfBirth} />
          <ReviewRow label="Address line 1" value={personalInfo.addressLine1} />
          <ReviewRow label="Address line 2" value={personalInfo.addressLine2} />
          <ReviewRow label="City" value={personalInfo.city} />
          <ReviewRow label="State" value={personalInfo.state} />
          <ReviewRow label="Postal code" value={personalInfo.postalCode} />
          <ReviewRow label="Email" value={personalInfo.email} />
          <ReviewRow label="Phone" value={personalInfo.phone} />
        </div>
      </SectionCard>

      <SectionCard title="Emergency Contact">
        <div className="grid gap-4 md:grid-cols-2">
          <ReviewRow label="Name" value={emergencyContact.name} />
          <ReviewRow label="Relationship" value={emergencyContact.relationship} />
          <ReviewRow label="Phone" value={emergencyContact.phone} />
          <ReviewRow label="Email" value={emergencyContact.email} />
        </div>
      </SectionCard>

      <SectionCard title="Medical Overview">
        <div className="grid gap-4 md:grid-cols-2">
          <ReviewRow label="Heart disease" value={yesNo(medicalInformation.heartDisease)} />
          <ReviewRow label="Shortness of breath" value={yesNo(medicalInformation.shortnessOfBreath)} />
          <ReviewRow label="High blood pressure" value={yesNo(medicalInformation.highBloodPressure)} />
          <ReviewRow label="Smoking" value={yesNo(medicalInformation.smoking)} />
          <ReviewRow label="Diabetes" value={yesNo(medicalInformation.diabetes)} />
          <ReviewRow label="Family history" value={yesNo(medicalInformation.familyHistory)} />
          <ReviewRow label="Workouts" value={yesNo(medicalInformation.workouts)} />
          <ReviewRow label="Medication" value={yesNo(medicalInformation.medication)} />
          <ReviewRow label="Alcohol" value={yesNo(medicalInformation.alcohol)} />
          <ReviewRow label="Last physical" value={medicalInformation.lastPhysical} />
          <ReviewRow label="Exercise restriction" value={medicalInformation.exerciseRestriction} />
        </div>

        <div className="mt-6 space-y-2 rounded-xl border border-brand-outline/30 bg-brand-surface-variant/60 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-secondary">Injuries</h4>
          <div className="grid gap-2 md:grid-cols-2">
            <ReviewRow label="Knees" value={yesNo(medicalInformation.injuries.knees)} />
            <ReviewRow label="Lower back" value={yesNo(medicalInformation.injuries.lowerBack)} />
            <ReviewRow label="Neck / shoulders" value={yesNo(medicalInformation.injuries.neckShoulders)} />
            <ReviewRow label="Hip / pelvis" value={yesNo(medicalInformation.injuries.hipPelvis)} />
            <ReviewRow
              label="Other injury"
              value={
                medicalInformation.injuries.other.has
                  ? medicalInformation.injuries.other.details || 'Details missing'
                  : 'No'
              }
            />
          </div>
        </div>

        <div className="mt-6 space-y-2 rounded-xl border border-brand-outline/30 bg-brand-surface-variant/40 p-4">
          <ReviewRow
            label="Recent injury"
            value={medicalInformation.hadRecentInjury === 'yes' ? 'Yes' : 'No'}
          />
          {medicalInformation.hadRecentInjury === 'yes' && (
            <div className="grid gap-2 md:grid-cols-2">
              <ReviewRow label="Injury details" value={medicalInformation.injuryDetails} />
              <ReviewRow
                label="Physician cleared"
                value={medicalInformation.physicianCleared ?? 'Not answered'}
              />
              <ReviewRow label="Clearance notes" value={medicalInformation.clearanceNotes} />
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Legal Confirmation">
        <div className="grid gap-4 md:grid-cols-2">
          <ReviewRow label="Risk initials" value={legalConfirmation.riskInitials} />
          <ReviewRow label="Release initials" value={legalConfirmation.releaseInitials} />
          <ReviewRow label="Indemnification initials" value={legalConfirmation.indemnificationInitials} />
          <ReviewRow label="Media initials" value={legalConfirmation.mediaInitials} />
        </div>
        <div className="mt-4 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-secondary">Signature</span>
          {legalConfirmation.signature.pngDataUrl ? (
            <div className="rounded-xl border border-brand-outline/30 bg-brand-surface p-3 shadow-sm">
              <img
                src={legalConfirmation.signature.pngDataUrl}
                alt="Signature preview"
                className="h-32 w-full object-contain"
              />
            </div>
          ) : (
            <p className="text-sm text-brand-secondary/70 italic">Signature not captured</p>
          )}
        </div>
      </SectionCard>

      <SectionCard>
        <label className="flex items-start gap-3 text-sm font-medium text-brand-on-surface">
          <input
            type="checkbox"
            className={checkboxClasses}
            {...register('review.confirmAccuracy', { required: true })}
          />
          <span>
            I confirm that the information provided is accurate and I agree to submit my waiver electronically.
          </span>
        </label>
        {errors.review?.confirmAccuracy && (
          <p className="mt-2 text-xs font-medium text-brand-error">
            {errors.review.confirmAccuracy.message as string}
          </p>
        )}
      </SectionCard>
    </div>
  )
}

